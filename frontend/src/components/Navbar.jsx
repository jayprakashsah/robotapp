import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { 
  Cpu, Home, LifeBuoy, Bot, LogIn, LogOut, Menu, X, 
  MessageSquare, Star, User, ChevronDown, 
  Bell, Settings, Shield, Activity, Zap, ExternalLink, Send,
  Users,
  Package,
  LayoutDashboard  // ✅ ADD THIS for admin icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import { WEB_API } from '../services/api';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(localStorage.getItem("user_name"));
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState({ rating: 0, comment: "", category: "general" });
    const [notificationCount, setNotificationCount] = useState(3);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAdminUser, setIsAdminUser] = useState(false);
    

    const userDropdownRef = useRef(null);
    const feedbackModalRef = useRef(null);

    // Update state whenever the URL changes
    useEffect(() => {
        setCurrentUser(localStorage.getItem("user_name"));
        setIsMenuOpen(false);
        setShowUserDropdown(false);
    }, [location]);

    // Check if user is admin
    useEffect(() => {
        const checkIfAdmin = () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setIsAdminUser(false);
                return;
            }
            
            try {
                // Decode token to check role
                const decoded = JSON.parse(atob(token.split('.')[1]));
                console.log('🔍 Decoded token role:', decoded.role); // Debug log
                setIsAdminUser(decoded.role === 'admin');
            } catch (error) {
                console.error('Error decoding token:', error);
                setIsAdminUser(false);
            }
        };
        
        checkIfAdmin();
    }, [location]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
            if (feedbackModalRef.current && !feedbackModalRef.current.contains(event.target) && showFeedbackModal) {
                setShowFeedbackModal(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showFeedbackModal]);

    // Scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        // Clear all auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_id');
        localStorage.removeItem('robot_ip');
        
        setCurrentUser(null);
        setIsAdminUser(false);
        navigate("/login");
        setShowUserDropdown(false);
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const currentUser = localStorage.getItem('user_name');
            const robotIP = localStorage.getItem('robot_ip');
            
            // Send to Node.js backend
            await WEB_API.post('/feedback', {
                name: currentUser || 'Anonymous',
                email: currentUser ? `${currentUser}@user.com` : 'anonymous@user.com',
                message: feedback.comment,
                rating: feedback.rating,
                category: feedback.category,
                robotIP: robotIP || 'not_connected',
                page: window.location.pathname
            });
            
            // Success message
            alert(`Thank you for your ${feedback.rating}-star feedback!`);
            
            setFeedback({ rating: 0, comment: "", category: "general" });
            setShowFeedbackModal(false);
            
        } catch (error) {
            console.error("Feedback submission failed:", error);
            
            // Fallback: Save to localStorage for offline sync
            alert("Feedback saved locally. Will sync when backend is available.");
            
            const localFeedback = {
                rating: feedback.rating,
                comment: feedback.comment,
                category: feedback.category,
                timestamp: new Date().toISOString()
            };
            
            const existing = JSON.parse(localStorage.getItem('pending_feedback') || '[]');
            existing.push(localFeedback);
            localStorage.setItem('pending_feedback', JSON.stringify(existing));
            
            setShowFeedbackModal(false);
        }
    };

    const handleNotificationClick = () => {
        setNotificationCount(0);
        // Show notification dropdown in real implementation
    };

    const isActive = (path) => location.pathname === path 
        ? "text-cyan-400 bg-gradient-to-r from-cyan-500/10 to-transparent" 
        : "text-slate-400 hover:text-white hover:bg-white/5";

    // Navigation items with icons and descriptions
    const navItems = [
        { path: "/", label: "Home", icon: <Home size={18} />, desc: "Main Dashboard" },
        { path: "/dashboard", label: "My Robot", icon: <Bot size={18} />, desc: "Robot Controls" },
        { path: "/community", label: "Community", icon: <Users size={18} />, desc: "Feedback & Q&A" },
        { path: "/products", label: "Our Products", icon: <Package size={18} />, desc: "View All Products" },
        { path: "/support", label: "Support", icon: <LifeBuoy size={18} />, desc: "Help Center" },
        // Add admin link conditionally
        ...(isAdminUser ? [
            { path: "/admin", label: "Admin Panel", icon: <Shield size={18} />, desc: "Admin Dashboard" }
        ] : [])
    ];

    return (
        <>
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled 
                        ? "border-b border-white/10 bg-[#050b16]/90 backdrop-blur-xl shadow-2xl shadow-cyan-500/5" 
                        : "border-b border-white/5 bg-[#050b16]/80 backdrop-blur-lg"
                } px-4 sm:px-6 py-3`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    
                    {/* LOGO with Hover Effect */}
                    <motion.div 
                        onClick={() => navigate("/")} 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-shadow">
                                <Cpu size={22} className="text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-wider text-slate-100">
                                SUPER<span className="text-purple-400">EMO</span>
                            </span>
                            <span className="text-xs text-slate-400 hidden sm:block">
                                Emotional Robotics Platform
                            </span>
                        </div>
                    </motion.div>

                    {/* DESKTOP NAVIGATION LINKS */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => (
                            <motion.button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                whileHover={{ y: -2 }}
                                whileTap={{ y: 0 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.path)}`}
                            >
                                {item.icon}
                                <div className="text-left">
                                    <div>{item.label}</div>
                                    <div className="text-xs text-slate-500 hidden xl:block">{item.desc}</div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* DESKTOP ACTION BUTTONS */}
                    <div className="hidden lg:flex items-center gap-3">
                        {/* Notifications */}
                        {currentUser && (
                            <motion.button
                                onClick={handleNotificationClick}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                            >
                                <Bell size={20} className="text-slate-400" />
                                {notificationCount > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs font-bold flex items-center justify-center"
                                    >
                                        {notificationCount}
                                    </motion.span>
                                )}
                            </motion.button>
                        )}

                        {currentUser ? (
                            <div className="relative" ref={userDropdownRef}>
                                <motion.button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 hover:border-cyan-500/30 transition-all group"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                                        <User size={16} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-semibold text-slate-100">
                                            Hi, {currentUser.length > 10 ? currentUser.substring(0, 10) + "..." : currentUser}
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                            <Activity size={10} className="text-green-500 animate-pulse" />
                                            {isAdminUser ? "Admin User" : "Online"}
                                        </div>
                                    </div>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                                </motion.button>

                                {/* USER DROPDOWN MENU */}
                                <AnimatePresence>
                                    {showUserDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-64 rounded-2xl bg-gradient-to-b from-[#0a0f1d] to-[#050b16] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-xl"
                                        >
                                            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                                                <div className="font-bold text-slate-100">{currentUser}</div>
                                                <div className="text-xs text-slate-400">
                                                    {isAdminUser ? "Administrator" : "Premium User"}
                                                </div>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <button className="w-full text-left px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-3">
                                                    <Settings size={16} className="text-slate-400" />
                                                    Settings
                                                </button>
                                                
                                                {/* ADMIN PANEL LINK - Only for admin users */}
                                                {isAdminUser && (
                                                    <button 
                                                        onClick={() => { 
                                                            navigate("/admin"); 
                                                            setShowUserDropdown(false); 
                                                        }}
                                                        className="w-full text-left px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-3"
                                                    >
                                                        <LayoutDashboard size={16} className="text-cyan-400" />
                                                        Admin Panel
                                                    </button>
                                                )}
                                                
                                                {/* MY ORDERS BUTTON */}
                                                <button 
                                                    onClick={() => { 
                                                        navigate("/my-orders"); 
                                                        setShowUserDropdown(false); 
                                                    }}
                                                    className="w-full text-left px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-3"
                                                >
                                                    <Package size={16} className="text-blue-400" />
                                                    My Orders
                                                </button>
                                                
                                                <button 
                                                    onClick={() => { 
                                                        navigate("/feedback"); 
                                                        setShowUserDropdown(false); 
                                                    }}
                                                    className="w-full text-left px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-3"
                                                >
                                                    <MessageSquare size={16} className="text-purple-400" />
                                                    Feedback
                                                </button>
                                                
                                                <button className="w-full text-left px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-3">
                                                    <Shield size={16} className="text-green-400" />
                                                    Security
                                                </button>
                                            </div>
                                            <div className="p-2 border-t border-white/10">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                                                >
                                                    <LogOut size={16} />
                                                    Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.button
                                onClick={() => navigate("/login")}
                                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-bold text-white border border-cyan-500/50 transition-all relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <LogIn size={16} />
                                    Login
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </motion.button>
                        )}
                    </div>

                    {/* MOBILE MENU TOGGLE */}
                    <motion.button 
                        className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {isMenuOpen ? <X size={22} className="text-slate-300" /> : <Menu size={22} className="text-slate-300" />}
                    </motion.button>
                </div>

                {/* MOBILE MENU */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="lg:hidden overflow-hidden"
                        >
                            <div className="pt-4 pb-6 px-4 space-y-2 bg-gradient-to-b from-white/5 to-transparent">
                                {navItems.map((item) => (
                                    <motion.button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsMenuOpen(false);
                                        }}
                                        whileHover={{ x: 10 }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isActive(item.path)}`}
                                    >
                                        {item.icon}
                                        <div>
                                            <div className="font-medium">{item.label}</div>
                                            <div className="text-xs text-slate-500">{item.desc}</div>
                                        </div>
                                    </motion.button>
                                ))}
                                
                                {/* Mobile Quick Feedback Button */}
                                <motion.button
                                    onClick={() => {
                                        setShowFeedbackModal(true);
                                        setIsMenuOpen(false);
                                    }}
                                    whileHover={{ x: 10 }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-300 hover:text-yellow-400 hover:bg-gradient-to-r from-yellow-500/10 to-transparent"
                                >
                                    <Star size={18} />
                                    <div>
                                        <div className="font-medium">Quick Feedback</div>
                                        <div className="text-xs text-slate-500">Quick rating</div>
                                    </div>
                                </motion.button>

                                {/* Mobile User Actions */}
                                {currentUser ? (
                                    <div className="pt-4 border-t border-white/10 space-y-2">
                                        <div className="px-4 py-3 flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                                                <User size={18} className="text-white" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-100">{currentUser}</div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Activity size={10} className="text-green-500 animate-pulse" />
                                                    {isAdminUser ? "Admin User" : "Online"}
                                                </div>
                                                {isAdminUser && (
                                                    <button 
                                                        onClick={() => {
                                                            navigate("/admin");
                                                            setIsMenuOpen(false);
                                                        }}
                                                        className="mt-2 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <LayoutDashboard size={16} />
                                                        Admin Panel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            navigate("/login");
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold mt-4"
                                    >
                                        <LogIn size={16} />
                                        Login to Dashboard
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* QUICK FEEDBACK MODAL */}
            <AnimatePresence>
                {showFeedbackModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            ref={feedbackModalRef}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md rounded-3xl bg-gradient-to-br from-[#0a0f1d] to-[#050b16] border border-white/10 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-orange-500/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                                            <Star size={24} className="text-yellow-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-100">Quick Feedback</h3>
                                            <p className="text-sm text-slate-400">Rate your experience</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowFeedbackModal(false)}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-6">
                                {/* Star Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Rate Your Experience</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                                                className="p-2 hover:scale-110 transition-transform"
                                            >
                                                <Star 
                                                    size={28} 
                                                    className={feedback.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-slate-400"} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                                    <select
                                        value={feedback.category}
                                        onChange={(e) => setFeedback(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                    >
                                        <option value="general">General Feedback</option>
                                        <option value="ui">User Interface</option>
                                        <option value="performance">Performance</option>
                                        <option value="features">Features Request</option>
                                        <option value="bug">Bug Report</option>
                                    </select>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Your Comments</label>
                                    <textarea
                                        value={feedback.comment}
                                        onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-yellow-500/50 transition-colors min-h-[120px]"
                                        placeholder="What do you think about SuperEmo?"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <motion.button
                                        type="button"
                                        onClick={() => setShowFeedbackModal(false)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold flex items-center justify-center gap-2"
                                    >
                                        <Send size={16} />
                                        Submit Feedback
                                    </motion.button>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowFeedbackModal(false);
                                            navigate("/feedback");
                                        }}
                                        className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        Want to give detailed feedback? Go to Feedback Page →
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}