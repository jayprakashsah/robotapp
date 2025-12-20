import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, Zap, ShieldCheck, ArrowRight, Activity, 
  X, Cpu, Camera, Brain, Database, Lock, 
  Cloud, Users, BarChart3, Globe,
  ChevronRight, AlertTriangle, Clock, Network,
  Github, Twitter, Linkedin, Mail, ExternalLink,
  Heart, Code, Shield, Rocket, Wifi,
  MessageSquare, Download, Terminal, Settings,
  BrainCircuit, Server, Fingerprint, Key,
  FileText, CheckCircle // Added FileText and CheckCircle
} from "lucide-react";
import robotOpen from "../assets/open.png";

// Detailed information for each feature
const FEATURE_DETAILS = {
  "Computer Vision": {
    icon: <Camera className="text-cyan-400" size={28} />,
    color: "cyan",
    tagline: "Real-Time Environmental Intelligence",
    description: "Advanced vision system powered by OpenCV and Raspberry Pi Camera Module for comprehensive environmental analysis.",
    details: [
      {
        icon: <Cpu size={18} />,
        title: "Processing Power",
        value: "30 FPS @ 640x480",
        description: "Real-time processing with minimal latency using optimized OpenCV pipelines"
      },
      {
        icon: <Eye size={18} />,
        title: "Face Detection",
        value: "99.2% Accuracy",
        description: "Haar Cascade classifiers with machine learning optimization"
      },
      {
        icon: <Clock size={18} />,
        title: "Response Time",
        value: "< 150ms",
        description: "Near-instantaneous detection and tracking capabilities"
      }
    ],
    techStack: ["OpenCV 4.8", "NumPy", "Picamera2", "Python 3.11"],
    applications: [
      "Real-time surveillance monitoring",
      "Object recognition and tracking",
      "Gesture interpretation",
      "Motion detection algorithms"
    ]
  },
  "Emotion Engine": {
    icon: <Brain className="text-purple-400" size={28} />,
    color: "purple",
    tagline: "Advanced Affective Computing",
    description: "Deep learning models that interpret and respond to human emotional states through visual analysis.",
    details: [
      {
        icon: <Users size={18} />,
        title: "Emotion Categories",
        value: "7 States",
        description: "Happy, Sad, Angry, Surprised, Fearful, Disgusted, Neutral"
      },
      {
        icon: <BarChart3 size={18} />,
        title: "Model Accuracy",
        value: "94.7%",
        description: "Validated against FER-2013 dataset benchmarks"
      },
      {
        icon: <Brain size={18} />,
        title: "Processing",
        value: "Neural Network",
        description: "Custom CNN architecture optimized for Raspberry Pi"
      }
    ],
    techStack: ["TensorFlow Lite", "Keras", "FER API", "PyTorch Mobile"],
    applications: [
      "Human-robot interaction enhancement",
      "Mental wellness monitoring",
      "Customer sentiment analysis",
      "Educational engagement tracking"
    ]
  },
  "Secure Cloud": {
    icon: <Cloud className="text-green-400" size={28} />,
    color: "green",
    tagline: "Enterprise-Grade Data Protection",
    description: "End-to-end encrypted cloud infrastructure ensuring privacy and security of all processed data.",
    details: [
      {
        icon: <Lock size={18} />,
        title: "Encryption",
        value: "AES-256",
        description: "Military-grade encryption for data at rest and in transit"
      },
      {
        icon: <Database size={18} />,
        title: "Storage",
        value: "MongoDB Atlas",
        description: "Fully managed cloud database with automatic scaling"
      },
      {
        icon: <ShieldCheck size={18} />,
        title: "Compliance",
        value: "GDPR Ready",
        description: "Built-in compliance with global privacy regulations"
      }
    ],
    techStack: ["MongoDB Atlas", "AWS S3", "JWT Auth", "OAuth 2.0"],
    applications: [
      "Secure data archival",
      "Multi-device synchronization",
      "Analytics dashboard access",
      "Remote configuration management"
    ]
  }
};

// Footer links data
const FOOTER_LINKS = {
  product: [
    { label: "Dashboard", icon: <Terminal size={14} /> },
    { label: "API Documentation", icon: <Code size={14} /> },
    { label: "Mobile App", icon: <Rocket size={14} /> },
    { label: "Changelog", icon: <Activity size={14} /> }
  ],
  resources: [
    { label: "Getting Started", icon: <Rocket size={14} /> },
    { label: "Tutorials", icon: <BrainCircuit size={14} /> },
    { label: "API Reference", icon: <Code size={14} /> },
    { label: "Community Forum", icon: <MessageSquare size={14} /> }
  ],
  company: [
    { label: "About Us", icon: <Users size={14} /> },
    { label: "Careers", icon: <Heart size={14} /> },
    { label: "Blog", icon: <MessageSquare size={14} /> },
    { label: "Contact", icon: <Mail size={14} /> }
  ],
  security: [
    { label: "Privacy Policy", icon: <Shield size={14} /> },
    { label: "Terms of Service", icon: <FileText size={14} /> }, // Fixed: Now FileText is defined
    { label: "Security Overview", icon: <Fingerprint size={14} /> },
    { label: "Compliance", icon: <Key size={14} /> }
  ]
};

export default function Home() {
    const navigate = useNavigate();
    const [currentUser] = useState(localStorage.getItem("user_name"));
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [activeDetailIndex, setActiveDetailIndex] = useState(0);
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterStatus, setNewsletterStatus] = useState("idle");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { 
                staggerChildren: 0.15,
                delayChildren: 0.2
            } 
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { 
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const handleFeatureClick = (feature) => {
        setSelectedFeature(feature);
        setActiveDetailIndex(0);
        document.body.style.overflow = 'hidden';
    };

    const closeFeatureModal = () => {
        setSelectedFeature(null);
        document.body.style.overflow = 'auto';
    };

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!newsletterEmail) return;
        
        setNewsletterStatus("loading");
        setTimeout(() => {
            setNewsletterStatus("success");
            setNewsletterEmail("");
            setTimeout(() => setNewsletterStatus("idle"), 3000);
        }, 1500);
    };

    const handleDownloadSource = () => {
        alert("Starting download of SuperEmo v2.1 source code...");
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#050b16] via-[#0a1122] to-[#050b16] text-white font-sans overflow-x-hidden">
            
            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
                {/* Animated Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] bg-cyan-500/10 blur-[100px] rounded-full animate-pulse-slow" />
                    <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] bg-purple-500/8 blur-[80px] rounded-full" />
                    <div className="absolute top-3/4 left-1/3 h-[300px] w-[300px] bg-green-500/5 blur-[60px] rounded-full animate-pulse-slow" />
                </div>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="relative z-10 max-w-5xl mx-auto"
                >
                    <motion.div variants={itemVariants} className="mb-8">
                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-5 py-2 text-sm font-bold text-cyan-400 uppercase tracking-widest">
                            <Activity size={14} className="animate-pulse" /> System Operational • v2.1
                        </span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                        The Future of
                        <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
                            Emotional Robotics
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-xl lg:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                        World's first Raspberry Pi powered emotional companion with 
                        <span className="text-cyan-300 font-semibold"> real-time surveillance</span>, 
                        <span className="text-purple-300 font-semibold"> emotion detection</span>, and 
                        <span className="text-green-300 font-semibold"> secure cloud integration</span>.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <button 
                            onClick={() => navigate(currentUser ? "/dashboard" : "/login")}
                            className="group relative px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-2xl text-lg hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all duration-300 flex items-center gap-3 overflow-hidden"
                        >
                            <span className="relative z-10">
                                {currentUser ? "Open Dashboard" : "Access Console"}
                            </span>
                            <ArrowRight size={22} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>
                        <button className="px-10 py-5 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl text-lg hover:border-cyan-500/50 hover:bg-white/15 transition-all duration-300">
                            View Technical Specs
                        </button>
                    </motion.div>

                    {/* Stats Bar */}
                    <motion.div 
                        variants={itemVariants}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
                    >
                        {[
                            { label: "Processing Speed", value: "30 FPS", icon: <Cpu size={16} /> },
                            { label: "Detection Accuracy", value: "99.2%", icon: <Eye size={16} /> },
                            { label: "Cloud Latency", value: "< 50ms", icon: <Network size={16} /> },
                            { label: "Uptime", value: "99.9%", icon: <ShieldCheck size={16} /> }
                        ].map((stat, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400">{stat.label}</span>
                                    {stat.icon}
                                </div>
                                <div className="text-xl font-bold font-mono">{stat.value}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Robot Image with Enhanced Effects */}
                <motion.div 
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1.2, type: "spring" }}
                    className="relative mt-20 z-10"
                >
                    <div className="relative w-72 h-72 sm:w-96 sm:h-96 mx-auto">
                        {/* Glow Effects */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl animate-pulse-slow"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10 animate-ping-slow"></div>
                        
                        {/* Orbiting Elements */}
                        <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-orbit-slow"></div>
                        <div className="absolute -top-6 -right-6 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 animate-orbit-reverse-slow"></div>
                        
                        {/* Main Robot Image */}
                        <img 
                            src={robotOpen} 
                            alt="SuperEmo Robot" 
                            className="relative w-full h-full object-contain drop-shadow-[0_0_60px_rgba(6,182,212,0.4)] animate-float"
                        />
                    </div>
                </motion.div>
            </section>

            {/* FEATURES GRID SECTION */}
            <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent via-[#03070e] to-[#050b16]">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                Core Technologies
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Advanced systems working in harmony to deliver unparalleled emotional intelligence
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
                    >
                        {Object.entries(FEATURE_DETAILS).map(([feature, data], index) => (
                            <motion.div
                                key={feature}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                                onClick={() => handleFeatureClick(feature)}
                                className="relative group cursor-pointer"
                            >
                                <div className={`relative p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 transition-all duration-300 hover:border-${data.color}-500/40 overflow-hidden backdrop-blur-sm`}>
                                    {/* Background Glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-br from-${data.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                    
                                    {/* Icon with Animation */}
                                    <div className={`relative mb-8 p-4 rounded-2xl bg-gradient-to-br from-${data.color}-500/20 to-${data.color}-500/5 w-fit group-hover:scale-110 transition-transform duration-300`}>
                                        {data.icon}
                                    </div>

                                    <h3 className="relative text-2xl font-bold mb-3">{feature}</h3>
                                    <p className="relative text-slate-400 mb-6">{data.description}</p>
                                    
                                    {/* Interactive Indicator */}
                                    <div className="relative flex items-center justify-between">
                                        <span className="text-sm text-slate-500 group-hover:text-cyan-400 transition-colors">
                                            Click to explore
                                        </span>
                                        <ChevronRight size={18} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-2 transition-all" />
                                    </div>
                                    
                                    {/* Hover Effect Line */}
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${data.color}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* INTERACTIVE FOOTER */}
            <footer className="relative overflow-hidden bg-gradient-to-t from-black/50 to-transparent border-t border-white/10">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] bg-cyan-500/5 blur-[80px] rounded-full"></div>
                    <div className="absolute top-1/4 right-1/4 h-[200px] w-[200px] bg-purple-500/3 blur-[60px] rounded-full"></div>
                </div>

                {/* Main Footer Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Brand Section */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
                                    <Brain size={24} className="text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Super<span className="text-cyan-400">Emo</span></h3>
                                    <p className="text-slate-400 text-sm">Emotional Robotics Platform</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                The world's most advanced emotional intelligence platform, 
                                combining cutting-edge AI with responsive robotics.
                            </p>
                            
                            {/* Social Links */}
                            <div className="flex items-center gap-3">
                                {[
                                    { icon: <Github size={18} />, label: "GitHub" },
                                    { icon: <Twitter size={18} />, label: "Twitter" },
                                    { icon: <Linkedin size={18} />, label: "LinkedIn" },
                                    { icon: <Mail size={18} />, label: "Email" }
                                ].map((social, idx) => (
                                    <motion.a
                                        key={idx}
                                        href="#"
                                        whileHover={{ y: -2 }}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                                        aria-label={social.label}
                                    >
                                        <div className="text-slate-400 group-hover:text-white transition-colors">
                                            {social.icon}
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links Grid */}
                        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                                <div key={category} className="space-y-4">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                        {category}
                                    </h4>
                                    <ul className="space-y-2">
                                        {links.map((link, idx) => (
                                            <motion.li
                                                key={idx}
                                                whileHover={{ x: 4 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <a 
                                                    href="#" 
                                                    className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm transition-colors group"
                                                >
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {link.icon}
                                                    </span>
                                                    {link.label}
                                                </a>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter & CTA Section */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Newsletter */}
                            <div className="lg:col-span-2">
                                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Mail size={18} className="text-cyan-400" />
                                    Stay Updated
                                </h4>
                                <p className="text-slate-400 text-sm mb-4">
                                    Subscribe to our newsletter for the latest updates, tutorials, and insights.
                                </p>
                                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="email"
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                        required
                                    />
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={newsletterStatus === "loading"}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {newsletterStatus === "loading" ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Subscribing...
                                            </>
                                        ) : newsletterStatus === "success" ? (
                                            <>
                                                <CheckCircle size={16} />
                                                Subscribed!
                                            </>
                                        ) : (
                                            "Subscribe"
                                        )}
                                    </motion.button>
                                </form>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleDownloadSource}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600/20 to-green-500/10 border border-green-500/30 text-green-400 font-bold hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    Download Source
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate("/dashboard")}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-purple-500/10 border border-purple-500/30 text-purple-400 font-bold hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Terminal size={18} />
                                    Live Demo
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-slate-400 text-sm flex items-center gap-2">
                            <Heart size={12} className="text-red-400 animate-pulse" />
                            Made with emotion by SuperEmo Team
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span>System Online</span>
                                </div>
                                <span className="text-slate-500">•</span>
                                <span>v2.1.0</span>
                            </div>
                            <div className="text-xs text-slate-500">
                                © {new Date().getFullYear()} SuperEmo Robotics. All rights reserved.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Robot in Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="absolute -top-12 right-8 hidden lg:block"
                >
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl"></div>
                        <img 
                            src={robotOpen} 
                            alt="Robot" 
                            className="relative w-full h-full object-contain opacity-80"
                        />
                    </div>
                </motion.div>
            </footer>

            {/* FEATURE DETAIL MODAL */}
            <AnimatePresence>
                {selectedFeature && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeFeatureModal}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        >
                            {/* Modal Container */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[#0a0f1d] to-[#050b16] border border-white/10 shadow-2xl`}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={closeFeatureModal}
                                    className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-red-500/20 border border-white/10 text-white transition-all"
                                >
                                    <X size={20} />
                                </button>

                                {/* Header */}
                                <div className="p-8 border-b border-white/10">
                                    <div className="flex items-start gap-6">
                                        <div className={`p-4 rounded-2xl bg-gradient-to-br from-${FEATURE_DETAILS[selectedFeature].color}-500/20 to-transparent`}>
                                            {FEATURE_DETAILS[selectedFeature].icon}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-4xl font-bold mb-2">{selectedFeature}</h2>
                                            <p className="text-xl text-slate-300 mb-4">{FEATURE_DETAILS[selectedFeature].tagline}</p>
                                            <p className="text-slate-400">{FEATURE_DETAILS[selectedFeature].description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Column: Key Metrics */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <h3 className="text-2xl font-bold mb-6">Key Metrics</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {FEATURE_DETAILS[selectedFeature].details.map((detail, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    onClick={() => setActiveDetailIndex(index)}
                                                    className={`p-5 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border ${activeDetailIndex === index ? `border-${FEATURE_DETAILS[selectedFeature].color}-500/50` : 'border-white/10'} cursor-pointer transition-all`}
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className={`p-2 rounded-lg bg-${FEATURE_DETAILS[selectedFeature].color}-500/10`}>
                                                            {detail.icon}
                                                        </div>
                                                        <span className="text-slate-400">{detail.title}</span>
                                                    </div>
                                                    <div className="text-2xl font-bold font-mono mb-2">{detail.value}</div>
                                                    <p className="text-sm text-slate-400">{detail.description}</p>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Tech Stack */}
                                        <div>
                                            <h3 className="text-2xl font-bold mb-4">Technology Stack</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {FEATURE_DETAILS[selectedFeature].techStack.map((tech, index) => (
                                                    <span key={index} className="px-4 py-2 rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/10 text-sm">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Applications */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-4">Real-World Applications</h3>
                                            <div className="space-y-3">
                                                {FEATURE_DETAILS[selectedFeature].applications.map((app, index) => (
                                                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                                        <div className="p-2 rounded-lg bg-gradient-to-br from-white/10 to-transparent">
                                                            <ChevronRight size={16} className={`text-${FEATURE_DETAILS[selectedFeature].color}-400`} />
                                                        </div>
                                                        <span className="text-slate-300">{app}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Active Detail Preview */}
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                                            <h4 className="text-lg font-bold mb-3">
                                                {FEATURE_DETAILS[selectedFeature].details[activeDetailIndex]?.title}
                                            </h4>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                {FEATURE_DETAILS[selectedFeature].details[activeDetailIndex]?.description}
                                            </p>
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-500">Current Value</span>
                                                    <span className="text-xl font-bold font-mono">
                                                        {FEATURE_DETAILS[selectedFeature].details[activeDetailIndex]?.value}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Globe size={16} />
                                            Integrated with all SuperEmo systems
                                        </div>
                                        <button 
                                            onClick={() => navigate("/dashboard")}
                                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
                                        >
                                            Try in Dashboard <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Add custom animations to global CSS */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes orbit {
                    from { transform: rotate(0deg) translateX(40px) rotate(0deg); }
                    to { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
                }
                @keyframes orbit-reverse {
                    from { transform: rotate(0deg) translateX(30px) rotate(0deg); }
                    to { transform: rotate(-360deg) translateX(30px) rotate(360deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-orbit-slow {
                    animation: orbit 20s linear infinite;
                }
                .animate-orbit-reverse-slow {
                    animation: orbit-reverse 25s linear infinite;
                }
                .animate-pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .animate-ping-slow {
                    animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 8s ease infinite;
                }
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}</style>
        </div>
    );
}