import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Power, AlertCircle, CheckCircle, Loader2, Wifi, WifiOff, Database, Server } from "lucide-react";
import { WEB_API, api, checkBackendHealth } from '../services/api';
import fallbackAuth from '../services/authFallback';

import robotOpen from "../assets/open.png";
import robotClose from "../assets/close.png";

// Icons (unchanged)
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 384 512" width="20" fill="white">
    <path d="M318.7 268.7c-.2-137 112.9-193 117.9-195.5-64.2-93.8-165.4-106.5-201.6-107.9C148.4-42.9 79 6.1 79 6.1s-60.9-45-171.1-43.8c-88.3 1.3-170.2 51.3-216.1 131-92.3 160.4 20.5 476 110.6 477.2 88.9 1.2 122.7-57.4 230.5-57.4 106.6 0 137 57.4 229.5 57.4 94.8 0 196.7-305.5 116.6-478.8-6.4-3.6-69.8-39.7-70.3-163zM275.1 16.9c49.5-60.7 82.9-143.5 73.6-204.6-55.1 2.4-121.8 37.2-171.6 97.5-46.1 55.3-86.4 137-78 199.1 61.6 4.8 125-32.7 176-92z"/>
  </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const [isAwake, setIsAwake] = useState(true);
    const [activeTab, setActiveTab] = useState("login");
    
    // Login state
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    
    // Register state
    const [registerData, setRegisterData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [registerError, setRegisterError] = useState("");
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    
    // Backend status
    const [backendStatus, setBackendStatus] = useState({
        status: 'checking',
        message: 'Checking backend connection...',
        dbConnected: false
    });

    // Check backend status on mount
    useEffect(() => {
        checkBackendStatus();
        
        // Check if already logged in
        const token = localStorage.getItem('auth_token');
        if (token) {
            verifyAndRedirect(token);
        }
    }, []);

    const checkBackendStatus = async () => {
        try {
            console.log("🔄 Checking backend and database status...");
            const health = await checkBackendHealth();
            
            if (health.status === 'connected') {
                // Check if database is connected
                const isDbConnected = health.data?.database === 'connected';
                
                setBackendStatus({
                    status: 'connected',
                    message: isDbConnected ? '✅ Backend & MongoDB Atlas connected' : '⚠️ Backend online but MongoDB disconnected',
                    dbConnected: isDbConnected
                });
                
                if (isDbConnected) {
                    console.log("✅ Backend and MongoDB Atlas are connected!");
                } else {
                    console.warn("⚠️ Backend running but MongoDB not connected");
                }
            } else {
                setBackendStatus({
                    status: 'disconnected',
                    message: '❌ Backend server offline',
                    dbConnected: false
                });
                console.error("❌ Backend server is not running");
            }
        } catch (error) {
            setBackendStatus({
                status: 'error',
                message: '❌ Cannot connect to backend',
                dbConnected: false
            });
            console.error("❌ Backend check failed:", error.message);
        }
    };

    const verifyAndRedirect = async (token) => {
        try {
            console.log("🔍 Checking existing session...");
            const response = await WEB_API.get('/auth/verify', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                console.log("✅ Valid session found, redirecting to dashboard");
                navigate('/dashboard');
            } else {
                console.log("❌ Invalid session, clearing token");
                localStorage.removeItem('auth_token');
            }
        } catch (error) {
            console.error("❌ Session verification failed");
            localStorage.removeItem('auth_token');
        }
    };

    const togglePower = () => {
        setIsAwake(!isAwake);
        setLoginError("");
        setRegisterError("");
        setRegisterSuccess(false);
    };

    // ✅ FIXED: SECURE LOGIN WITHOUT LOGGING SENSITIVE DATA
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);

        try {
            console.log("🔐 Attempting login...");
            
            if (backendStatus.dbConnected) {
                // Use real MongoDB database
                console.log("📊 Using MongoDB Atlas authentication");
                
                const response = await WEB_API.post('/auth/login', {
                    email: loginData.email.toLowerCase().trim(),
                    password: loginData.password
                });

                if (response.data.success) {
                    // Save token and user info
                    localStorage.setItem('auth_token', response.data.token);
                    localStorage.setItem('user_name', response.data.user.username);
                    localStorage.setItem('user_email', response.data.user.email);
                    localStorage.setItem('user_id', response.data.user.id);
                    localStorage.setItem('user_role', response.data.user.role);

                    console.log("✅ MongoDB Atlas login successful!");
                    
                    navigate('/dashboard');
                } else {
                    setLoginError(response.data.message || 'Login failed');
                }
            } else {
                // Backend/database offline - use fallback
                console.warn("⚠️ Backend offline, using fallback authentication");
                
                const result = await fallbackAuth.login(loginData.email, loginData.password);
                
                if (result.success) {
                    localStorage.setItem('auth_token', result.token);
                    localStorage.setItem('user_name', result.user.username);
                    localStorage.setItem('user_email', result.user.email);
                    localStorage.setItem('user_id', result.user.id);
                    localStorage.setItem('user_role', result.user.role);
                    
                    console.log("✅ Fallback login successful");
                    navigate('/dashboard');
                } else {
                    setLoginError(result.message || 'Offline login failed');
                }
            }

        } catch (error) {
            console.error("❌ Login error:", error.message);
            
            if (error.response) {
                const status = error.response.status;
                const errorMsg = error.response.data?.message || 'Server error';
                
                if (status === 401) {
                    setLoginError("Invalid email or password");
                } else if (status === 404) {
                    setLoginError("No account found with this email");
                } else if (status === 403) {
                    setLoginError("Account is deactivated");
                } else {
                    setLoginError(`Login failed: ${errorMsg}`);
                }
                
                console.log(`❌ Login failed with status ${status}`);
                
            } else if (error.request) {
                // Network error - try fallback
                console.log("🌐 Network error, trying fallback auth");
                try {
                    const result = await fallbackAuth.login(loginData.email, loginData.password);
                    if (result.success) {
                        localStorage.setItem('auth_token', result.token);
                        localStorage.setItem('user_name', result.user.username);
                        setLoginError("✅ Logged in offline mode. Connect backend for database access.");
                        setTimeout(() => navigate('/dashboard'), 1500);
                    } else {
                        setLoginError("Backend offline and fallback failed");
                    }
                } catch (fallbackError) {
                    setLoginError("Backend offline and fallback failed");
                }
                
            } else {
                setLoginError('Network error. Please check your connection.');
            }
        } finally {
            setLoginLoading(false);
        }
    };

    // ✅ FIXED: SECURE REGISTRATION WITHOUT LOGGING SENSITIVE DATA
    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError("");
        setRegisterLoading(true);

        // Validation
        if (registerData.password !== registerData.confirmPassword) {
            setRegisterError("Passwords don't match");
            setRegisterLoading(false);
            return;
        }

        if (registerData.password.length < 6) {
            setRegisterError("Password must be at least 6 characters");
            setRegisterLoading(false);
            return;
        }

        if (registerData.username.length < 3) {
            setRegisterError("Username must be at least 3 characters");
            setRegisterLoading(false);
            return;
        }

        try {
            console.log("📝 Attempting registration...");
            
            if (backendStatus.dbConnected) {
                // Use real MongoDB database
                console.log("📊 Registering user in MongoDB Atlas");
                
                const response = await WEB_API.post('/auth/register', {
                    username: registerData.username.trim(),
                    email: registerData.email.toLowerCase().trim(),
                    password: registerData.password
                });

                if (response.data.success) {
                    console.log("✅ MongoDB Atlas registration successful!");
                    
                    setRegisterSuccess(true);
                    
                    // Auto login after successful registration
                    setTimeout(() => {
                        localStorage.setItem('auth_token', response.data.token);
                        localStorage.setItem('user_name', response.data.user.username);
                        localStorage.setItem('user_email', response.data.user.email);
                        localStorage.setItem('user_id', response.data.user.id);
                        localStorage.setItem('user_role', response.data.user.role);
                        
                        console.log("🔑 Auto-login after registration");
                        navigate('/dashboard');
                    }, 1500);
                } else {
                    setRegisterError(response.data.message || 'Registration failed');
                }
            } else {
                // Backend offline - use fallback
                console.warn("⚠️ Backend offline, using fallback registration");
                
                const result = await fallbackAuth.register(
                    registerData.username,
                    registerData.email,
                    registerData.password
                );
                
                if (result.success) {
                    setRegisterSuccess(true);
                    
                    setTimeout(() => {
                        localStorage.setItem('auth_token', result.token);
                        localStorage.setItem('user_name', result.user.username);
                        localStorage.setItem('user_email', result.user.email);
                        localStorage.setItem('user_id', result.user.id);
                        localStorage.setItem('user_role', result.user.role);
                        
                        console.log("✅ Fallback registration successful");
                        navigate('/dashboard');
                    }, 1000);
                } else {
                    setRegisterError(result.message || 'Offline registration failed');
                }
            }

        } catch (error) {
            console.error("❌ Registration error:", error.message);
            
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                if (status === 409) {
                    setRegisterError("User with this email or username already exists");
                } else if (status === 400 && errorData.errors) {
                    setRegisterError(errorData.errors.join(', '));
                } else {
                    setRegisterError(errorData?.message || 'Registration failed');
                }
                
                console.log(`❌ Registration failed with status ${status}`);
                
            } else if (error.request) {
                // Network error - try fallback
                console.log("🌐 Network error, trying fallback registration");
                try {
                    const result = await fallbackAuth.register(
                        registerData.username,
                        registerData.email,
                        registerData.password
                    );
                    if (result.success) {
                        setRegisterSuccess(true);
                        setRegisterError("✅ Registered offline. Connect backend for database storage.");
                    } else {
                        setRegisterError("Registration failed. Check backend connection.");
                    }
                } catch (fallbackError) {
                    setRegisterError("Registration failed. Check backend connection.");
                }
                
            } else {
                setRegisterError('Network error. Please check your connection.');
            }
        } finally {
            setRegisterLoading(false);
        }
    };

    const renderBackendStatus = () => {
        const getStatusIcon = () => {
            switch(backendStatus.status) {
                case 'connected': return <Wifi className="text-green-400" size={16} />;
                case 'db_error': return <Database className="text-yellow-400" size={16} />;
                case 'disconnected': return <WifiOff className="text-red-400" size={16} />;
                default: return <Server className="text-blue-400" size={16} />;
            }
        };

        const getStatusColor = () => {
            switch(backendStatus.status) {
                case 'connected': return 'bg-green-500/10 border-green-500/20 text-green-400';
                case 'db_error': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
                case 'disconnected': return 'bg-red-500/10 border-red-500/20 text-red-400';
                default: return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            }
        };

        return (
            <div className={`mb-4 p-3 rounded-lg border ${getStatusColor()} transition-all`}>
                <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="text-sm font-medium">{backendStatus.message}</span>
                </div>
                
                {backendStatus.status === 'disconnected' && (
                    <div className="mt-2 text-xs">
                        <p className="opacity-80">To start backend:</p>
                        <code className="block mt-1 p-2 bg-black/30 rounded font-mono text-xs">
                            cd robot-app-backend && npm run dev
                        </code>
                    </div>
                )}
                
                {backendStatus.status === 'db_error' && (
                    <div className="mt-2 text-xs">
                        <p className="opacity-80">Check MongoDB Atlas connection in .env file</p>
                    </div>
                )}
            </div>
        );
    };

    const renderLoginForm = () => (
        <form onSubmit={handleLogin} className="space-y-5">
            {renderBackendStatus()}
            
            {loginError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                    <AlertCircle size={16} /> {loginError}
                </div>
            )}
            
            <div className="space-y-4">
                <input 
                    type="email" 
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full rounded-xl bg-[#050b16] border border-slate-800/80 p-4 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all"
                    placeholder="Email"
                    required
                />
                <input 
                    type="password" 
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full rounded-xl bg-[#050b16] border border-slate-800/80 p-4 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all"
                    placeholder="Password"
                    required
                />
            </div>
            
            <button 
                type="submit"
                disabled={loginLoading}
                className="w-full mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 font-bold text-lg text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loginLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" /> 
                        {backendStatus.dbConnected ? "Logging in..." : "Offline Login..."}
                    </span>
                ) : backendStatus.dbConnected ? "Login with Database" : "Login Offline"}
            </button>
        </form>
    );

    const renderRegisterForm = () => (
        <form onSubmit={handleRegister} className="space-y-5">
            {renderBackendStatus()}
            
            {registerError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                    <AlertCircle size={16} /> {registerError}
                </div>
            )}
            
            {registerSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-400 border border-green-500/20">
                    <CheckCircle size={16} /> Registration successful! Redirecting...
                </div>
            )}
            
            <div className="space-y-4">
                <input 
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                    className="w-full rounded-xl bg-[#050b16] border border-slate-800/80 p-4 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all"
                    placeholder="Username (min 3 characters)"
                    required
                    minLength="3"
                />
                <input 
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    className="w-full rounded-xl bg-[#050b16] border border-slate-800/80 p-4 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all"
                    placeholder="Email"
                    required
                />
                <input 
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className="w-full rounded-xl bg-[#050b16] border border-slate-800/80 p-4 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all"
                    placeholder="Password (min 6 characters)"
                    required
                    minLength="6"
                />
                <input 
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    className="w-full rounded-xl bg-[#050b16] border border-slate-800/80 p-4 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none transition-all"
                    placeholder="Confirm Password"
                    required
                    minLength="6"
                />
            </div>
            
            <button 
                type="submit"
                disabled={registerLoading || registerSuccess}
                className="w-full mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 font-bold text-lg text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {registerLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" /> 
                        {backendStatus.dbConnected ? "Creating Account..." : "Saving Offline..."}
                    </span>
                ) : registerSuccess ? "Success!" : (
                    backendStatus.dbConnected ? "Register in Database" : "Register Offline"
                )}
            </button>
        </form>
    );

    return (
        <div className="min-h-screen w-full bg-[#050b16] text-white font-sans overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full transition-all duration-1000 ${isAwake ? "bg-purple-600/15 blur-[120px]" : "bg-slate-800/20 blur-[80px]"}`} />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center pt-20 pb-12 min-h-screen gap-10">
                
                <div className="flex flex-col items-center gap-8 z-20">
                    <div className="relative group">
                        <div className={`relative h-56 w-56 overflow-hidden rounded-full border-4 shadow-2xl transition-all duration-700 ${isAwake ? "border-purple-500/50 shadow-[0_0_60px_-10px_rgba(168,85,247,0.5)]" : "border-slate-800 shadow-black grayscale"}`}>
                            <img src={isAwake ? robotOpen : robotClose} alt="Robot Avatar" className="h-full w-full object-cover"/>
                        </div>
                    </div>

                    <button 
                        onClick={togglePower}
                        className={`group flex items-center gap-3 rounded-full px-10 py-4 font-bold tracking-widest transition-all duration-300 ${isAwake ? "bg-[#0a0f1d] text-slate-400 hover:bg-slate-900 border border-slate-800" : "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-105"}`}
                    >
                        <Power size={20} className={isAwake ? "" : "animate-pulse"} />
                        {isAwake ? "ENTER SLEEP MODE" : "WAKE UP SYSTEM"}
                    </button>
                </div>

                {isAwake ? (
                    <div className="w-full max-w-[440px] px-4">
                        <div className="relative overflow-hidden rounded-3xl bg-[#050b16]/90 p-8 shadow-[0_0_50px_-12px_rgba(124,58,237,0.5)] border border-white/10 backdrop-blur-xl">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

                            <div className="flex mb-8 border-b border-white/10 relative">
                                <div 
                                    className="absolute bottom-0 h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-full"
                                    style={{
                                        width: "50%",
                                        left: activeTab === "login" ? "0%" : "50%",
                                        transition: 'left 0.3s ease'
                                    }}
                                />
                                <button 
                                    onClick={() => { 
                                        setActiveTab("login"); 
                                        setLoginError(""); 
                                        setRegisterError(""); 
                                        checkBackendStatus();
                                    }} 
                                    className={`w-1/2 pb-4 text-center font-semibold tracking-wide transition-colors ${activeTab === "login" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                                >
                                    Login
                                </button>
                                <button 
                                    onClick={() => { 
                                        setActiveTab("register"); 
                                        setLoginError(""); 
                                        setRegisterError(""); 
                                        checkBackendStatus();
                                    }} 
                                    className={`w-1/2 pb-4 text-center font-semibold tracking-wide transition-colors ${activeTab === "register" ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                                >
                                    Register
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-6">
                                {activeTab === "login" ? "Welcome Back" : "Create Account"}
                            </h2>
                            
                            {activeTab === "login" ? renderLoginForm() : renderRegisterForm()}
                            
                            {activeTab === "login" && backendStatus.dbConnected && (
                                <>
                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-slate-800"></div>
                                        <span className="flex-shrink mx-4 text-slate-500 text-sm">or</span>
                                        <div className="flex-grow border-t border-slate-800"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <button 
                                            type="button" 
                                            className="flex items-center justify-center gap-3 w-full rounded-xl border border-slate-700 bg-[#0a0f1d] p-4 font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all active:scale-[0.99]"
                                        >
                                            <GoogleIcon /> Continue with Google
                                        </button>
                                        <button 
                                            type="button" 
                                            className="flex items-center justify-center gap-3 w-full rounded-xl border border-slate-700 bg-[#0a0f1d] p-4 font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all active:scale-[0.99]"
                                        >
                                            <AppleIcon /> Continue with Apple
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-400">
                        <p className="text-lg">System is sleeping...</p>
                        <p className="text-sm mt-2">Click "Wake Up System" to activate</p>
                    </div>
                )}
            </div>
        </div>
    );
}