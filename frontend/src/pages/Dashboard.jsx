import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Battery, Wifi, Thermometer, Video, Lock, RefreshCw,
  Network, AlertTriangle, CheckCircle, Edit3, QrCode, X, Info,
  Zap, Activity, Shield, Power, Settings, Camera
} from "lucide-react";

import { createRobotAPI } from '../services/api'; // NEW: Import robot API creator

export default function Dashboard() {
  // STATE: Connection & Logic
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [robotIP, setRobotIP] = useState(localStorage.getItem("robot_ip") || "");
  const [inputIP, setInputIP] = useState(localStorage.getItem("robot_ip") || "");
  const [errorMsg, setErrorMsg] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  // STATE: Dashboard Data
  const [status, setStatus] = useState({
    battery: 0,
    wifi_strength: "Unknown",
    cpu_temp: 0,
    status: "Offline"
  });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  // --- CONNECT LOGIC ---
  const handleConnect = async (ipToConnect = inputIP) => {
    setConnectionStatus("scanning");
    setErrorMsg("");

    try {
      // NEW: Create robot API instance with user's IP
      const robotAPI = createRobotAPI(ipToConnect);
      
      // Test connection
      await robotAPI.get('/robot/status', { timeout: 3000 });
      
      // Save to localStorage
      const formattedIP = robotAPI.defaults.baseURL;
      setRobotIP(formattedIP);
      setInputIP(formattedIP);
      localStorage.setItem("robot_ip", formattedIP);
      
      setConnectionStatus("connected");
      setShowQrScanner(false);
      
    } catch (err) {
      setConnectionStatus("error");
      setErrorMsg("Connection Failed. Check IP or WiFi network.");
    }
  };

  // --- QR SCAN LOGIC ---
  const handleQrScan = (data) => {
    if (data) {
      console.log("QR Found:", data.text);
      setInputIP(data.text);
      handleConnect(data.text);
    }
  };

  const handleQrError = (err) => {
    console.error(err);
    setErrorMsg("Camera permission denied or error reading QR.");
  };

  // --- DATA POLLING ---
  useEffect(() => {
    if (connectionStatus !== "connected" || !robotIP) return;

    const fetchStatus = async () => {
      try {
        // NEW: Use createRobotAPI for each request
        const robotAPI = createRobotAPI(robotIP);
        const res = await robotAPI.get('/robot/status');
        setStatus(res.data);
      } catch (err) {
        setStatus(prev => ({ ...prev, status: "Connection Lost" }));
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [connectionStatus, robotIP]);

  // ==========================================
  // VIEW 1: DISCONNECTED
  // ==========================================
  if (connectionStatus !== "connected") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#050b16] via-[#0a1122] to-[#050b16] text-white flex items-center justify-center font-sans p-6 pt-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] bg-cyan-500/5 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] bg-blue-500/3 blur-[80px] rounded-full" />
          <div className="absolute top-3/4 left-1/3 h-[200px] w-[200px] bg-purple-500/2 blur-[60px] rounded-full" />
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-cyan-500/10"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <motion.div 
              className="h-20 w-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-cyan-500/30 relative"
              animate={{ 
                boxShadow: connectionStatus === 'scanning' 
                  ? "0 0 30px rgba(6,182,212,0.3)" 
                  : "0 0 15px rgba(6,182,212,0.1)" 
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <Network size={36} className={`text-cyan-400 ${connectionStatus === 'scanning' ? 'animate-pulse' : ''}`} />
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-20"></div>
            </motion.div>
            <h2 className="text-2xl font-bold tracking-wide text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Establish Uplink
            </h2>
            <p className="text-slate-400 text-sm mt-2">Connect to your SuperEmo Unit to begin.</p>
          </div>

          {/* QR SCANNER VIEW */}
          <AnimatePresence>
            {showQrScanner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 rounded-xl overflow-hidden border-2 border-cyan-500/30 relative bg-black/50 backdrop-blur-sm"
              >
                <div className="relative">
                
                  <div className="absolute inset-0 pointer-events-none border-[24px] border-black/60"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-cyan-400/80 rounded-lg animate-pulse shadow-lg shadow-cyan-500/30">
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-cyan-400"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-cyan-400"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-cyan-400"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-cyan-400"></div>
                  </div>
                  <button
                    onClick={() => setShowQrScanner(false)}
                    className="absolute top-3 right-3 p-2 bg-black/70 text-white rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-sm"
                  >
                    <X size={20} />
                  </button>
                  <p className="absolute bottom-4 left-0 right-0 text-center text-xs font-mono text-cyan-300 bg-black/50 py-2">
                    ALIGN QR CODE IN FRAME
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MANUAL INPUT FORM */}
          {!showQrScanner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              {/* Instructions Card */}
              <div className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3 items-start backdrop-blur-sm">
                <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-blue-300 block mb-1">Pre-Flight Checklist:</strong>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Ensure Robot is <strong className="text-cyan-300">Powered ON</strong>.</li>
                    <li>Your device and Robot must be on the <strong className="text-cyan-300">Same WiFi</strong>.</li>
                    <li>Default Port is usually <code className="bg-black/30 px-1 rounded">:8000</code>.</li>
                  </ul>
                </div>
              </div>

              {/* IP Input */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                    <Zap size={16} className="text-cyan-400/70" />
                  </span>
                  <input
                    type="text"
                    value={inputIP}
                    onChange={(e) => setInputIP(e.target.value)}
                    placeholder="192.168.x.x:8000"
                    className="w-full bg-[#0a0f1d]/80 border border-white/10 rounded-xl py-4 pl-12 pr-4 font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all backdrop-blur-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  />
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-300 text-sm bg-gradient-to-r from-red-500/10 to-red-500/5 p-3 rounded-lg border border-red-500/20"
                  >
                    <AlertTriangle size={16} /> {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  onClick={() => handleConnect(inputIP)}
                  disabled={connectionStatus === "scanning"}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {connectionStatus === "scanning" ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Activity size={18} /> Connect
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </motion.button>

                <motion.button
                  onClick={() => { setErrorMsg(""); setShowQrScanner(true); }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-b from-white/10 to-white/5 border border-white/15 hover:border-cyan-500/30 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <QrCode size={18} /> Scan QR
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: CONNECTED DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#050b16] via-[#0a1122] to-[#050b16] text-white pt-24 pb-12 px-4 sm:px-6 font-sans">
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- LEFT: VIDEO FEED --- */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 overflow-hidden shadow-2xl relative backdrop-blur-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-lg">
                  <Camera size={20} className="text-cyan-400" />
                </div>
                <div>
                  <span className="font-bold tracking-wide text-white">LIVE OPTICAL FEED</span>
                  <p className="text-xs text-slate-400">Real-time vision processing active</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/5 group">
                  <span className="text-xs font-mono text-slate-300">{robotIP.replace("http://", "")}</span>
                  <motion.button
                    onClick={() => setConnectionStatus("disconnected")}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Power size={12} />
                  </motion.button>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
                  <span className="animate-pulse h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="text-xs font-mono text-red-400">REC</span>
                </div>
              </div>
            </div>

            {/* Video Area */}
            <div className="aspect-video bg-gradient-to-br from-black to-gray-900 relative overflow-hidden">
              <img
                src={`${robotIP}/video_feed?t=${Date.now()}`}
                alt="Live Feed"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/600x400/111827/2dd4bf?text=Signal+Lost";
                }}
              />
              
              {/* Connection Quality */}
              <div className="absolute top-4 left-4 flex items-center gap-2 backdrop-blur-sm bg-black/40 px-3 py-1.5 rounded-lg">
                <div className={`h-2 w-2 rounded-full ${status.wifi_strength === 'Excellent' ? 'bg-green-500' : status.wifi_strength === 'Good' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className="text-xs font-mono text-white">{status.wifi_strength}</span>
              </div>

              {/* Recording Timer */}
              <div className="absolute top-4 right-4 flex items-center gap-2 backdrop-blur-sm bg-black/60 px-3 py-1.5 rounded-lg">
                <span className="animate-pulse h-2 w-2 rounded-full bg-red-500"></span>
                <span className="text-xs font-mono text-white">00:24:17</span>
              </div>

              {/* Latency/Stats Footer */}
              <div className="absolute bottom-4 left-0 right-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-cyan-300 bg-black/60 px-3 py-1.5 rounded-lg">
                    LATENCY: <strong>24ms</strong>
                  </span>
                  <span className="text-xs font-mono text-white/70 bg-black/60 px-3 py-1.5 rounded-lg">
                    640x480 @ 30FPS
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 bg-black/60 px-3 py-1.5 rounded-lg">
                  UPTIME: 2H 17M
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT: CONTROLS --- */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatusCard icon={<Battery className="text-green-400" />} label="Battery" value={`${status.battery}%`} />
            <StatusCard icon={<Thermometer className="text-orange-400" />} label="CPU Temp" value={`${status.cpu_temp}°C`} />
            <StatusCard icon={<Wifi className="text-blue-400" />} label="Signal" value={status.wifi_strength} />
            <StatusCard icon={<CheckCircle className="text-purple-400" />} label="System" value={status.status} />
          </div>

          {/* Security Controls */}
          <div className="rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <div className="p-2 bg-gradient-to-br from-slate-500/20 to-slate-500/10 rounded-lg">
                <Shield size={18} className="text-slate-300" />
              </div>
              Security Controls
            </h3>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/30 text-red-300 font-bold hover:from-red-500/20 hover:to-red-500/10 transition-all flex items-center justify-center gap-2 group"
              >
                <Power size={18} />
                Emergency Stop
                <div className="ml-auto h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/30 text-cyan-300 font-bold hover:from-cyan-500/20 hover:to-blue-500/10 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Reboot System
              </motion.button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-lg">
                <Settings size={18} className="text-cyan-300" />
              </div>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['Calibrate', 'Diagnostic', 'Logs', 'Settings'].map((action, idx) => (
                <motion.button
                  key={action}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="py-3 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-cyan-500/30 text-white text-sm font-medium transition-all"
                >
                  {action}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Enhanced StatusCard Component
function StatusCard({ icon, label, value }) {
  const getStatusColor = () => {
    if (label === "Battery") {
      const battery = parseInt(value);
      if (battery > 70) return "text-green-400";
      if (battery > 30) return "text-yellow-400";
      return "text-red-400";
    }
    if (label === "CPU Temp") {
      const temp = parseInt(value);
      if (temp > 80) return "text-red-400";
      if (temp > 60) return "text-yellow-400";
      return "text-cyan-400";
    }
    return "text-white";
  };

  return (
    <motion.div
      className="relative overflow-hidden bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-5 rounded-2xl shadow-lg backdrop-blur-sm group"
      whileHover={{ 
        y: -4, 
        boxShadow: "0 12px 20px -10px rgba(6, 182, 212, 0.2)",
        borderColor: "rgba(6, 182, 212, 0.3)"
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative z-10 flex flex-col items-center justify-center gap-3">
        <div className="p-3 bg-gradient-to-br from-white/10 to-transparent rounded-full">
          {icon}
        </div>
        <span className="text-slate-400 text-xs uppercase tracking-wider font-medium">{label}</span>
        <span className={`text-2xl font-bold font-mono ${getStatusColor()}`}>
          {value}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );
}