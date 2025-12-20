// frontend/src/pages/Feedback.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, AlertCircle, CheckCircle, Loader2, Bug, Lightbulb, HelpCircle, Wrench, Star } from 'lucide-react';
import feedbackService from '../services/feedbackService';

const Feedback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [myFeedback, setMyFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  const [formData, setFormData] = useState({
    type: 'bug',
    title: '',
    message: '',
    priority: 'medium',
    robotIp: localStorage.getItem('robot_ip') || ''
  });

  const feedbackTypes = [
    { id: 'bug', label: 'Bug Report', icon: <Bug size={18} />, color: 'text-red-400' },
    { id: 'feature', label: 'Feature Request', icon: <Lightbulb size={18} />, color: 'text-yellow-400' },
    { id: 'improvement', label: 'Improvement', icon: <Wrench size={18} />, color: 'text-blue-400' },
    { id: 'question', label: 'Question', icon: <HelpCircle size={18} />, color: 'text-purple-400' },
    { id: 'other', label: 'Other', icon: <MessageSquare size={18} />, color: 'text-gray-400' }
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: 'bg-green-500' },
    { id: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { id: 'high', label: 'High', color: 'bg-orange-500' },
    { id: 'critical', label: 'Critical', color: 'bg-red-500' }
  ];

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const fetchMyFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const response = await feedbackService.getMyFeedback();
      if (response.success) {
        setMyFeedback(response.feedback || []);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic validation
      if (!formData.title.trim() || !formData.message.trim()) {
        throw new Error('Title and message are required');
      }

      if (formData.title.length < 5) {
        throw new Error('Title must be at least 5 characters');
      }

      if (formData.message.length < 10) {
        throw new Error('Message must be at least 10 characters');
      }

      const response = await feedbackService.submitFeedback(formData);
      
      if (response.success) {
        setSubmitted(true);
        setFormData({
          type: 'bug',
          title: '',
          message: '',
          priority: 'medium',
          robotIp: localStorage.getItem('robot_ip') || ''
        });
        
        // Refresh feedback list
        fetchMyFeedback();
        
        // Auto-reset success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(response.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'reviewing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type) => {
    const found = feedbackTypes.find(t => t.id === type);
    return found ? found.icon : <MessageSquare size={16} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b16] via-[#0a1122] to-[#050b16] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Feedback & Support
          </h1>
          <p className="text-slate-400 mt-2">
            Report issues, suggest features, or ask questions about the robot system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Feedback Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#0a0f1d]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                  <MessageSquare size={24} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Submit Feedback</h2>
                  <p className="text-slate-400 text-sm">We value your input to improve our system</p>
                </div>
              </div>

              {submitted && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-green-600/10 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-400" />
                    <div>
                      <p className="font-medium text-green-400">✅ Feedback Submitted Successfully!</p>
                      <p className="text-sm text-green-400/70 mt-1">
                        Thank you for your feedback. We'll review it and get back to you if needed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-400" />
                    <div>
                      <p className="font-medium text-red-400">❌ Error</p>
                      <p className="text-sm text-red-400/70 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Feedback Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {feedbackTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${formData.type === type.id
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                            : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:bg-slate-800/50 hover:border-slate-600'
                          }`}
                      >
                        <span className={type.color}>{type.icon}</span>
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-[#050b16] border border-slate-800/80 p-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all"
                    placeholder="Brief description of your feedback"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Detailed Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className="w-full rounded-xl bg-[#050b16] border border-slate-800/80 p-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
                    placeholder="Please provide as much detail as possible. Include steps to reproduce for bugs, or specific requirements for feature requests."
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.message.length}/1000 characters
                  </p>
                </div>

                {/* Priority & Robot IP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Priority
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {priorities.map((priority) => (
                        <button
                          key={priority.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, priority: priority.id }))}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${formData.priority === priority.id
                              ? `bg-${priority.color.split('-')[1]}-500/20 border-${priority.color.split('-')[1]}-500/50 text-white`
                              : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                            }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${priority.color}`}></div>
                          <span className="text-xs font-medium">{priority.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Robot IP (Optional)
                    </label>
                    <input
                      type="text"
                      name="robotIp"
                      value={formData.robotIp}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-[#050b16] border border-slate-800/80 p-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      placeholder="e.g., 192.168.1.100"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 font-bold text-lg text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      Submitting Feedback...
                    </span>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - My Feedback */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a0f1d]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                    <Star size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">My Feedback</h2>
                    <p className="text-slate-400 text-sm">History of your submissions</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">
                  {myFeedback.length} items
                </span>
              </div>

              {loadingFeedback ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-slate-500" />
                </div>
              ) : myFeedback.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={48} className="mx-auto text-slate-700 mb-4" />
                  <p className="text-slate-500">No feedback submitted yet</p>
                  <p className="text-sm text-slate-600 mt-1">Your feedback will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {myFeedback.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-800/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <h3 className="font-medium text-sm truncate">{item.title}</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mb-3">
                        {item.message.substring(0, 60)}...
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{formatDate(item.createdAt)}</span>
                        <span className={`px-2 py-1 rounded ${item.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                            item.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                          }`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {myFeedback.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-800/50">
                  <div className="text-center">
                    <button
                      onClick={() => fetchMyFeedback()}
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Refresh List
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-[#0a0f1d]/50 backdrop-blur-sm rounded-2xl border border-slate-800/30 p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-300">Tips for Effective Feedback</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Bug size={16} className="text-red-400" />
                </div>
                <h4 className="font-medium text-slate-300">Bug Reports</h4>
              </div>
              <p className="text-sm text-slate-400">
                Include steps to reproduce, expected vs actual behavior, and screenshots if possible.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Lightbulb size={16} className="text-yellow-400" />
                </div>
                <h4 className="font-medium text-slate-300">Feature Requests</h4>
              </div>
              <p className="text-sm text-slate-400">
                Explain the problem you're solving, who it benefits, and how it should work.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Wrench size={16} className="text-blue-400" />
                </div>
                <h4 className="font-medium text-slate-300">Response Time</h4>
              </div>
              <p className="text-sm text-slate-400">
                We aim to respond within 2-3 business days. Critical issues are prioritized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;