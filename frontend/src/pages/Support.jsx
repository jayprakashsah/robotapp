import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { 
  Shield, Server, Activity, Wrench, MessageCircle, FileText, CheckCircle,
  HelpCircle, Zap, Globe, Users, Clock, ArrowRight, Cpu, Camera,
  Wifi, Database, Lock, Smartphone, Headphones, Mail,
  ChevronDown, ExternalLink, AlertCircle, Star, Award,
  Send, Bot, X, User, Loader2, AlertTriangle, ThumbsUp, ThumbsDown
} from "lucide-react";

import { WEB_API } from '../services/api'; // NEW: Import web API

// EmailJS Configuration (Fallback option)
const EMAILJS_CONFIG = {
  SERVICE_ID: "service_uyj5uhn",
  TEMPLATE_ID: "template_bx4jmbb",
  PUBLIC_KEY: "uL4u_pwYc_dTjS52E"
};

// Support topics data
const SUPPORT_TOPICS = [
  {
    icon: <Server className="text-purple-400" size={24} />,
    title: "Cloud & Data Management",
    description: "Manage MongoDB Atlas storage, retrieve encrypted logs, and sync emotional data history.",
    features: [
      "Real-time database monitoring",
      "Encrypted backup automation",
      "Data export/import tools",
      "API rate limit management"
    ],
    urgencyLevel: "medium",
    avgResponseTime: "2-4 hours"
  },
  {
    icon: <Wrench className="text-cyan-400" size={24} />,
    title: "Hardware Diagnostics",
    description: "Troubleshoot motor issues, camera calibration, and Raspberry Pi connection failures.",
    features: [
      "Live hardware telemetry",
      "Motor calibration wizard",
      "Camera alignment tools",
      "Power consumption analysis"
    ],
    urgencyLevel: "high",
    avgResponseTime: "1-2 hours"
  },
  {
    icon: <Shield className="text-green-400" size={24} />,
    title: "Security Center",
    description: "Update firewall rules, manage user access tokens, and review login activity logs.",
    features: [
      "Real-time threat detection",
      "Access token management",
      "Audit log viewer",
      "GDPR compliance tools"
    ],
    urgencyLevel: "high",
    avgResponseTime: "15-30 minutes"
  },
  {
    icon: <Cpu className="text-orange-400" size={24} />,
    title: "AI & ML Support",
    description: "Emotion model training, neural network optimization, and performance tuning.",
    features: [
      "Model accuracy analysis",
      "Training dataset management",
      "Inference speed optimization",
      "Custom emotion training"
    ],
    urgencyLevel: "low",
    avgResponseTime: "6-12 hours"
  },
  {
    icon: <Smartphone className="text-blue-400" size={24} />,
    title: "Mobile App Support",
    description: "Dashboard app troubleshooting, push notifications, and sync issues.",
    features: [
      "App crash diagnostics",
      "Notification configuration",
      "Cross-platform sync",
      "Offline mode troubleshooting"
    ],
    urgencyLevel: "medium",
    avgResponseTime: "4-6 hours"
  },
  {
    icon: <Globe className="text-pink-400" size={24} />,
    title: "Network & Connectivity",
    description: "WiFi connectivity issues, latency problems, and network configuration.",
    features: [
      "Network speed tests",
      "Port configuration",
      "Firewall troubleshooting",
      "VPN setup assistance"
    ],
    urgencyLevel: "medium",
    avgResponseTime: "3-5 hours"
  }
];

// AI Assistant responses (we'll simulate API calls)
const AI_RESPONSES = {
  greetings: [
    "Hello! I'm your SuperEmo Assistant. How can I help you today?",
    "Hi there! I'm here to assist with your SuperEmo unit. What seems to be the issue?",
    "Welcome! I'm the SuperEmo support bot. Tell me about your problem and I'll help you solve it."
  ],
  hardware: [
    "For hardware issues, try resetting your Raspberry Pi and checking all cable connections.",
    "Make sure your camera module is properly connected to the CSI port.",
    "Check the power supply - SuperEmo requires stable 5V/2A input."
  ],
  software: [
    "Try updating to the latest firmware from the dashboard settings.",
    "Clear your browser cache if experiencing dashboard issues.",
    "Check if all required Python packages are installed correctly."
  ],
  network: [
    "Ensure your robot and device are on the same WiFi network.",
    "Try restarting your router and reconnecting the robot.",
    "Check firewall settings that might block port 8000."
  ],
  default: [
    "I understand. Our support team will review this and get back to you shortly.",
    "Thanks for the details. Let me escalate this to our technical team.",
    "I've noted your issue. Check your email for further instructions."
  ]
};

// Message type for chat
const MESSAGE_TYPE = {
  USER: "user",
  BOT: "bot"
};

export default function Support() {
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    topic: "",
    urgency: "medium",
    message: ""
  });
  const [formStatus, setFormStatus] = useState({ type: "idle", message: "" });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeChatTopic, setActiveChatTopic] = useState(null);
  const chatEndRef = useRef(null);
  const [chatRating, setChatRating] = useState(null);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Auto-open chat when clicking support cards
  useEffect(() => {
    if (activeChatTopic) {
      setChatOpen(true);
      // Add welcome message if chat is empty
      if (chatMessages.length === 0) {
        const welcomeMsg = AI_RESPONSES.greetings[
          Math.floor(Math.random() * AI_RESPONSES.greetings.length)
        ];
        setChatMessages([
          {
            type: MESSAGE_TYPE.BOT,
            text: welcomeMsg,
            timestamp: new Date()
          }
        ]);
      }
    }
  }, [activeChatTopic]);

  const handleTopicClick = (index) => {
    setExpandedTopic(expandedTopic === index ? null : index);
  };

  const handleFAQClick = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const handleStartChat = (topic) => {
    setActiveChatTopic(topic);
    if (!chatOpen) {
      setChatOpen(true);
    }
  };

  // NEW: Updated handleFormSubmit function
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ type: "loading", message: "Sending your request..." });

    try {
      const currentUser = localStorage.getItem('user_name');
      const robotIP = localStorage.getItem('robot_ip');
      
      // Send to Node.js backend
      const response = await WEB_API.post('/support', {
        name: contactForm.name,
        email: contactForm.email,
        subject: `Support: ${contactForm.topic}`,
        description: contactForm.message,
        category: contactForm.topic.toLowerCase().includes('hardware') ? 'technical' : 'general',
        priority: contactForm.urgency,
        userId: currentUser || 'anonymous',
        robotIP: robotIP || 'not_connected'
      });

      setFormStatus({
        type: "success",
        message: `Support ticket #${response.data.ticketId} created! We'll email you at ${contactForm.email}`
      });

      // Reset form
      setContactForm({
        name: "",
        email: "",
        topic: "",
        urgency: "medium",
        message: ""
      });

      setTimeout(() => {
        setFormStatus({ type: "idle", message: "" });
      }, 5000);

    } catch (error) {
      console.error("Support ticket creation failed:", error);
      
      // Fallback to EmailJS if Node backend is down
      if (error.code === 'ERR_NETWORK') {
        setFormStatus({
          type: "warning",
          message: "Using email fallback. Ticket saved locally."
        });
        
        // Save to localStorage for offline sync
        const pendingTicket = {
          name: contactForm.name,
          email: contactForm.email,
          subject: `Support: ${contactForm.topic}`,
          description: contactForm.message,
          urgency: contactForm.urgency,
          timestamp: new Date().toISOString()
        };
        
        const existing = JSON.parse(localStorage.getItem('pending_tickets') || '[]');
        existing.push(pendingTicket);
        localStorage.setItem('pending_tickets', JSON.stringify(existing));
        
        // Reset form
        setContactForm({
          name: "",
          email: "",
          topic: "",
          urgency: "medium",
          message: ""
        });
        
      } else {
        setFormStatus({
          type: "error",
          message: error.response?.data?.message || "Failed to create support ticket."
        });
      }
    }
  };

  const handleFormChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage = {
      type: MESSAGE_TYPE.USER,
      text: chatInput,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Generate AI response based on keywords
      let response = "";
      const lowerInput = chatInput.toLowerCase();

      if (lowerInput.includes("hardware") || lowerInput.includes("camera") || lowerInput.includes("raspberry")) {
        response = AI_RESPONSES.hardware[
          Math.floor(Math.random() * AI_RESPONSES.hardware.length)
        ];
      } else if (lowerInput.includes("software") || lowerInput.includes("update") || lowerInput.includes("bug")) {
        response = AI_RESPONSES.software[
          Math.floor(Math.random() * AI_RESPONSES.software.length)
        ];
      } else if (lowerInput.includes("wifi") || lowerInput.includes("network") || lowerInput.includes("connect")) {
        response = AI_RESPONSES.network[
          Math.floor(Math.random() * AI_RESPONSES.network.length)
        ];
      } else {
        response = AI_RESPONSES.default[
          Math.floor(Math.random() * AI_RESPONSES.default.length)
        ];
      }

      // Add bot message
      const botMessage = {
        type: MESSAGE_TYPE.BOT,
        text: response,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
      setChatLoading(false);
    }, 1500);
  };

  const handleChatRating = (rating) => {
    setChatRating(rating);
    // Here you would typically send the rating to your backend
    setTimeout(() => {
      const botMessage = {
        type: MESSAGE_TYPE.BOT,
        text: rating === "good" 
          ? "Thank you for the feedback! I'm glad I could help. 😊"
          : "I'm sorry I couldn't help better. I'll improve!",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#050b16] via-[#0a1122] to-[#050b16] text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] bg-purple-500/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] bg-cyan-500/3 blur-[80px] rounded-full"></div>
        <div className="absolute top-3/4 left-1/3 h-[200px] w-[200px] bg-green-500/2 blur-[60px] rounded-full"></div>
      </div>

      <div className="relative pt-32 pb-12 px-4 sm:px-6">
        {/* HERO HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto text-center mb-20"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/5 px-5 py-2 text-sm font-bold text-green-400 uppercase tracking-widest mb-8"
          >
            <div className="flex items-center gap-2">
              <Activity size={14} className="animate-pulse" />
              <span>All Systems Operational</span>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-ping"></div>
            </div>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 leading-tight">
            How can we{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              assist you?
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Expert support for your SuperEmo Unit. Complaints are sent directly to our team at{" "}
            <span className="text-cyan-400 font-mono">emosuppoert@gmail.com</span>
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-cyan-400" />
                <div>
                  <div className="text-2xl font-bold font-mono">Direct</div>
                  <div className="text-xs text-slate-400">Email Support</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Bot size={20} className="text-purple-400" />
                <div>
                  <div className="text-2xl font-bold font-mono">24/7</div>
                  <div className="text-xs text-slate-400">AI Assistant</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold font-mono">15 min</div>
                  <div className="text-xs text-slate-400">Avg Response</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* INTERACTIVE SUPPORT GRID */}
        <div className="max-w-7xl mx-auto mb-24">
          <h2 className="text-3xl font-bold mb-10 text-center">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Click any card to start AI chat
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUPPORT_TOPICS.map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => handleStartChat(topic.title)}
                className="relative group cursor-pointer"
              >
                <div className={`p-6 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border ${expandedTopic === index ? 'border-cyan-500/50' : 'border-white/10'} transition-all duration-300 overflow-hidden backdrop-blur-sm hover:border-cyan-500/50`}>
                  {/* Urgency Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${topic.urgencyLevel === 'high' ? 'bg-red-500/20 text-red-400' : topic.urgencyLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {topic.urgencyLevel.toUpperCase()}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-white/10 to-transparent w-fit group-hover:scale-110 transition-transform duration-300">
                    {topic.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{topic.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{topic.description}</p>
                  
                  {/* Response Time */}
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <Clock size={14} />
                    Avg. response: {topic.avgResponseTime}
                  </div>

                  {/* Chat Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartChat(topic.title);
                    }}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-600/20 to-blue-600/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={14} />
                    Chat with AI Assistant
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CONTACT FORM SECTION */}
        <div className="max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 backdrop-blur-sm"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Send Email Complaint
              </span>
            </h2>
            
            <p className="text-slate-400 text-center mb-8">
              Your complaint will be sent directly to{" "}
              <span className="text-cyan-400 font-mono bg-black/30 px-2 py-1 rounded">sahprakash470@gmail.com</span>
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Topic *</label>
                  <select
                    value={contactForm.topic}
                    onChange={(e) => handleFormChange("topic", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    required
                  >
                    <option value="">Select a topic</option>
                    {SUPPORT_TOPICS.map((topic, index) => (
                      <option key={index} value={topic.title}>{topic.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Urgency Level</label>
                  <div className="flex gap-2">
                    {[
                      { value: "low", label: "Low", color: "bg-green-500/20 text-green-400" },
                      { value: "medium", label: "Medium", color: "bg-yellow-500/20 text-yellow-400" },
                      { value: "high", label: "High", color: "bg-red-500/20 text-red-400" }
                    ].map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => handleFormChange("urgency", level.value)}
                        className={`px-4 py-2 rounded-lg border ${contactForm.urgency === level.value ? 'border-cyan-500/50' : 'border-white/10'} ${level.color} transition-colors flex-1`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message *</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => handleFormChange("message", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-500/50 transition-colors min-h-[150px]"
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>

              {/* Status Message */}
              {formStatus.type !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl ${
                    formStatus.type === "success"
                      ? "bg-green-500/10 border border-green-500/30 text-green-400"
                      : formStatus.type === "error"
                      ? "bg-red-500/10 border border-red-500/30 text-red-400"
                      : formStatus.type === "warning"
                      ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                      : "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {formStatus.type === "loading" && <Loader2 className="animate-spin" size={20} />}
                    {formStatus.type === "success" && <CheckCircle size={20} />}
                    {formStatus.type === "error" && <AlertTriangle size={20} />}
                    {formStatus.type === "warning" && <AlertTriangle size={20} />}
                    <span>{formStatus.message}</span>
                  </div>
                </motion.div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={formStatus.type === "loading"}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {formStatus.type === "loading" ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending to sahprakash470@gmail.com...
                  </>
                ) : (
                  "Send Complaint via Email"
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* AI CHAT ASSISTANT (Floating Button) */}
        <motion.button
          onClick={() => setChatOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-2xl"
        >
          <Bot size={24} />
        </motion.button>

        {/* AI CHAT MODAL */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="relative w-full max-w-2xl h-[600px] rounded-3xl bg-gradient-to-br from-[#0a0f1d] to-[#050b16] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Chat Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                        <Bot size={24} className="text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">SuperEmo AI Assistant</h3>
                        <p className="text-sm text-slate-400">How can I help you today?</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setChatOpen(false);
                        setChatRating(null);
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.type === MESSAGE_TYPE.USER ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          msg.type === MESSAGE_TYPE.USER
                            ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30'
                            : 'bg-gradient-to-r from-white/5 to-transparent border border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {msg.type === MESSAGE_TYPE.USER ? (
                            <User size={16} className="text-cyan-400" />
                          ) : (
                            <Bot size={16} className="text-purple-400" />
                          )}
                          <span className="text-xs text-slate-400">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Loading Indicator */}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl p-4 bg-gradient-to-r from-white/5 to-transparent border border-white/10">
                        <div className="flex items-center gap-2">
                          <Bot size={16} className="text-purple-400" />
                          <Loader2 size={16} className="animate-spin text-purple-400" />
                          <span className="text-sm text-slate-400">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      disabled={chatLoading}
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={chatLoading || !chatInput.trim()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      <Send size={18} />
                    </motion.button>
                  </div>
                  
                  {/* Chat Rating */}
                  {chatMessages.length > 2 && !chatRating && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm text-slate-400">Was this helpful?</span>
                      <button
                        onClick={() => handleChatRating("good")}
                        className="p-2 rounded-lg hover:bg-green-500/20 transition-colors"
                      >
                        <ThumbsUp size={18} className="text-green-400" />
                      </button>
                      <button
                        onClick={() => handleChatRating("bad")}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <ThumbsDown size={18} className="text-red-400" />
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add animation styles */}
        <style>{`
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 8s ease infinite;
          }
        `}</style>
      </div>
    </div>
  );
}