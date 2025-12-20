// frontend/src/pages/FeedbackCommunity.jsx
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Star, ThumbsUp, ThumbsDown, Send, Plus, 
  Filter, Search, TrendingUp, HelpCircle, ChevronUp, 
  ChevronDown, CheckCircle, Clock, Users, Tag, Eye,
  MessageCircle, Award, BookOpen, Zap, Lightbulb, Bug,
  Flag, Heart, Share2, Bookmark, MoreVertical, X,
  AlertCircle, ExternalLink, Hash, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import communityService from '../services/feedbackCommunityService';

const FeedbackCommunity = () => {
  // State for Feedback Section
  const [feedbackList, setFeedbackList] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feedback'); // 'feedback' or 'questions'
  
  // Filter states
  const [feedbackFilters, setFeedbackFilters] = useState({
    category: 'all',
    sort: 'newest',
    search: ''
  });
  
  const [questionFilters, setQuestionFilters] = useState({
    category: 'all',
    sort: 'newest',
    solved: 'all',
    search: ''
  });
  
  // Modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState({ show: false, id: null, type: null });
  
  // Form states
  const [feedbackForm, setFeedbackForm] = useState({
    title: '',
    message: '',
    category: 'other',
    priority: 'medium',
    tags: [],
    isAnonymous: false
  });
  
  const [questionForm, setQuestionForm] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: []
  });
  
  const [replyForm, setReplyForm] = useState({
    message: ''
  });
  
  // Pagination
  const [feedbackPagination, setFeedbackPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  const [questionPagination, setQuestionPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Categories
  const feedbackCategories = [
    { id: 'all', label: 'All Feedback', icon: <MessageSquare size={16} />, color: 'bg-gray-500' },
    { id: 'bug', label: 'Bug Reports', icon: <Bug size={16} />, color: 'bg-red-500' },
    { id: 'feature', label: 'Feature Requests', icon: <Lightbulb size={16} />, color: 'bg-yellow-500' },
    { id: 'improvement', label: 'Improvements', icon: <Zap size={16} />, color: 'bg-blue-500' },
    { id: 'praise', label: 'Praise', icon: <Heart size={16} />, color: 'bg-pink-500' },
    { id: 'question', label: 'Questions', icon: <HelpCircle size={16} />, color: 'bg-purple-500' },
    { id: 'other', label: 'Other', icon: <Flag size={16} />, color: 'bg-gray-500' }
  ];
  
  const questionCategories = [
    { id: 'all', label: 'All Questions', icon: <HelpCircle size={16} /> },
    { id: 'technical', label: 'Technical', icon: <Zap size={16} /> },
    { id: 'usage', label: 'Usage', icon: <BookOpen size={16} /> },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: <AlertCircle size={16} /> },
    { id: 'feature', label: 'Features', icon: <Lightbulb size={16} /> },
    { id: 'installation', label: 'Installation', icon: <Award size={16} /> },
    { id: 'general', label: 'General', icon: <Users size={16} /> }
  ];

  // Fetch data on component mount and filter changes
  useEffect(() => {
    fetchData();
  }, [feedbackFilters, questionFilters, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'feedback') {
        const response = await communityService.getFeedback({
          page: feedbackPagination.page,
          limit: feedbackPagination.limit,
          category: feedbackFilters.category !== 'all' ? feedbackFilters.category : undefined,
          sort: feedbackFilters.sort,
          search: feedbackFilters.search
        });
        
        if (response.success) {
          setFeedbackList(response.feedback);
          setFeedbackPagination(response.pagination);
        }
      } else {
        const response = await communityService.getQuestions({
          page: questionPagination.page,
          limit: questionPagination.limit,
          category: questionFilters.category !== 'all' ? questionFilters.category : undefined,
          sort: questionFilters.sort,
          solved: questionFilters.solved !== 'all' ? questionFilters.solved : undefined,
          search: questionFilters.search
        });
        
        if (response.success) {
          setQuestionsList(response.questions);
          setQuestionPagination(response.pagination);
        }
      }
      
      // Fetch stats
      const statsResponse = await communityService.getStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle feedback submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      const response = await communityService.submitFeedback(feedbackForm);
      if (response.success) {
        alert('Feedback submitted successfully!');
        setShowFeedbackModal(false);
        setFeedbackForm({
          title: '',
          message: '',
          category: 'other',
          priority: 'medium',
          tags: [],
          isAnonymous: false
        });
        fetchData();
      }
    } catch (error) {
      alert('Error submitting feedback: ' + error.message);
    }
  };

  // Handle question submission
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    try {
      const response = await communityService.askQuestion(questionForm);
      if (response.success) {
        alert('Question posted successfully!');
        setShowQuestionModal(false);
        setQuestionForm({
          title: '',
          description: '',
          category: 'general',
          tags: []
        });
        fetchData();
      }
    } catch (error) {
      alert('Error posting question: ' + error.message);
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    try {
      const { id, type } = showReplyModal;
      if (type === 'feedback') {
        const response = await communityService.addReply(id, { message: replyForm.message });
        if (response.success) {
          alert('Reply added successfully!');
          setShowReplyModal({ show: false, id: null, type: null });
          setReplyForm({ message: '' });
          fetchData();
        }
      } else if (type === 'question') {
        const response = await communityService.answerQuestion(id, { answer: replyForm.message });
        if (response.success) {
          alert('Answer added successfully!');
          setShowReplyModal({ show: false, id: null, type: null });
          setReplyForm({ message: '' });
          fetchData();
        }
      }
    } catch (error) {
      alert('Error adding reply: ' + error.message);
    }
  };

  // Handle voting
  const handleVote = async (id, type, voteType) => {
    try {
      if (type === 'feedback') {
        await communityService.voteFeedback(id, voteType);
      } else if (type === 'question') {
        await communityService.voteQuestion(id, voteType);
      }
      fetchData();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get category color
  const getCategoryColor = (category) => {
    const cat = feedbackCategories.find(c => c.id === category);
    return cat ? cat.color : 'bg-gray-500';
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-slate-900/50 animate-pulse rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              <div className="h-10 bg-slate-800 rounded"></div>
            </div>
            <div className="h-8 w-8 bg-slate-800 rounded ml-4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b16] via-[#0a1122] to-[#050b16] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Community Hub
          </h1>
          <p className="text-slate-400 mt-2">
            Share feedback, ask questions, and help each other improve SuperEmo
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-cyan-900/20 to-cyan-600/10 rounded-2xl p-6 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-300">Total Feedback</p>
                  <p className="text-2xl font-bold">{stats.feedback.total}</p>
                </div>
                <MessageSquare className="text-cyan-400" size={24} />
              </div>
              <p className="text-xs text-cyan-400/70 mt-2">{stats.feedback.totalReplies} replies</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-600/10 rounded-2xl p-6 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-300">Total Questions</p>
                  <p className="text-2xl font-bold">{stats.questions.total}</p>
                </div>
                <HelpCircle className="text-purple-400" size={24} />
              </div>
              <p className="text-xs text-purple-400/70 mt-2">{stats.questions.totalAnswers} answers</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/20 to-green-600/10 rounded-2xl p-6 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300">Solved Questions</p>
                  <p className="text-2xl font-bold">
                    {stats.questions.byCategory.reduce((acc, cat) => acc + cat.solvedCount, 0)}
                  </p>
                </div>
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <p className="text-xs text-green-400/70 mt-2">Community solutions</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-600/10 rounded-2xl p-6 border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-300">Total Interactions</p>
                  <p className="text-2xl font-bold">{stats.community.totalInteractions}</p>
                </div>
                <Users className="text-yellow-400" size={24} />
              </div>
              <p className="text-xs text-yellow-400/70 mt-2">Active community</p>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Feedback */}
          <div className="lg:w-2/3">
            <div className="bg-[#0a0f1d]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'feedback'
                      ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-white border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare size={18} />
                    Feedback
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-800">
                      {stats?.feedback.total || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'questions'
                      ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <HelpCircle size={18} />
                    Q&A
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-800">
                      {stats?.questions.total || 0}
                    </span>
                  </button>
                </div>
                
                <button
                  onClick={() => activeTab === 'feedback' ? setShowFeedbackModal(true) : setShowQuestionModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:brightness-110 transition-all"
                >
                  <Plus size={18} />
                  {activeTab === 'feedback' ? 'Give Feedback' : 'Ask Question'}
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={activeTab === 'feedback' ? feedbackFilters.search : questionFilters.search}
                    onChange={(e) => {
                      if (activeTab === 'feedback') {
                        setFeedbackFilters({ ...feedbackFilters, search: e.target.value });
                      } else {
                        setQuestionFilters({ ...questionFilters, search: e.target.value });
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#050b16] border border-slate-800/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                
                <select
                  value={activeTab === 'feedback' ? feedbackFilters.category : questionFilters.category}
                  onChange={(e) => {
                    if (activeTab === 'feedback') {
                      setFeedbackFilters({ ...feedbackFilters, category: e.target.value });
                    } else {
                      setQuestionFilters({ ...questionFilters, category: e.target.value });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#050b16] border border-slate-800/80 text-white focus:outline-none focus:border-cyan-500"
                >
                  {activeTab === 'feedback'
                    ? feedbackCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))
                    : questionCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))
                  }
                </select>
                
                <select
                  value={activeTab === 'feedback' ? feedbackFilters.sort : questionFilters.sort}
                  onChange={(e) => {
                    if (activeTab === 'feedback') {
                      setFeedbackFilters({ ...feedbackFilters, sort: e.target.value });
                    } else {
                      setQuestionFilters({ ...questionFilters, sort: e.target.value });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#050b16] border border-slate-800/80 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="most-voted">Most Voted</option>
                  {activeTab === 'questions' && <option value="most-viewed">Most Viewed</option>}
                </select>
                
                {activeTab === 'questions' && (
                  <select
                    value={questionFilters.solved}
                    onChange={(e) => setQuestionFilters({ ...questionFilters, solved: e.target.value })}
                    className="px-4 py-2 rounded-xl bg-[#050b16] border border-slate-800/80 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All Questions</option>
                    <option value="solved">Solved Only</option>
                    <option value="unsolved">Unsolved Only</option>
                  </select>
                )}
              </div>

              {/* Content List */}
              <div className="space-y-4">
                {loading ? renderSkeleton() : (
                  <>
                    {activeTab === 'feedback' ? (
                      feedbackList.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare size={48} className="mx-auto text-slate-700 mb-4" />
                          <p className="text-slate-500">No feedback yet</p>
                          <p className="text-sm text-slate-600 mt-1">Be the first to share your thoughts!</p>
                        </div>
                      ) : (
                        feedbackList.map((feedback) => (
                          <motion.div
                            key={feedback._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6 hover:border-slate-700/70 transition-all"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${getCategoryColor(feedback.category)}`}></div>
                                <span className="text-sm text-slate-400">{feedback.category}</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                                  {feedback.priority}
                                </span>
                              </div>
                              <span className="text-sm text-slate-500">{formatDate(feedback.createdAt)}</span>
                            </div>
                            
                            <h3 className="text-lg font-semibold mb-2">{feedback.title}</h3>
                            <p className="text-slate-300 mb-4">{feedback.message}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleVote(feedback._id, 'feedback', 'upvote')}
                                    className="p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
                                  >
                                    <ChevronUp size={20} className="text-slate-400 hover:text-green-400" />
                                  </button>
                                  <span className="font-medium">{feedback.upvotes?.length || 0}</span>
                                  <button
                                    onClick={() => handleVote(feedback._id, 'feedback', 'downvote')}
                                    className="p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
                                  >
                                    <ChevronDown size={20} className="text-slate-400 hover:text-red-400" />
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => setShowReplyModal({ show: true, id: feedback._id, type: 'feedback' })}
                                  className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
                                >
                                  <MessageCircle size={18} />
                                  <span>{feedback.replies?.length || 0} replies</span>
                                </button>
                                
                                <button className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors">
                                  <Share2 size={18} />
                                  <span>Share</span>
                                </button>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                  {feedback.userName?.charAt(0) || 'A'}
                                </div>
                                <span className="text-sm text-slate-400">{feedback.userName}</span>
                              </div>
                            </div>
                            
                            {/* Replies Preview */}
                            {feedback.replies && feedback.replies.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-slate-800/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageCircle size={16} className="text-slate-500" />
                                  <span className="text-sm text-slate-500">Recent replies</span>
                                </div>
                                <div className="space-y-2">
                                  {feedback.replies.slice(0, 2).map((reply, index) => (
                                    <div key={index} className="bg-slate-900/30 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">{reply.userName}</span>
                                        <span className="text-xs text-slate-500">{formatDate(reply.createdAt)}</span>
                                      </div>
                                      <p className="text-sm text-slate-300">{reply.message}</p>
                                    </div>
                                  ))}
                                  {feedback.replies.length > 2 && (
                                    <button className="text-sm text-cyan-400 hover:text-cyan-300">
                                      View all {feedback.replies.length} replies
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))
                      )
                    ) : (
                      questionsList.length === 0 ? (
                        <div className="text-center py-12">
                          <HelpCircle size={48} className="mx-auto text-slate-700 mb-4" />
                          <p className="text-slate-500">No questions yet</p>
                          <p className="text-sm text-slate-600 mt-1">Be the first to ask a question!</p>
                        </div>
                      ) : (
                        questionsList.map((question) => (
                          <motion.div
                            key={question._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6 hover:border-slate-700/70 transition-all"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <button
                                  onClick={() => handleVote(question._id, 'question', 'upvote')}
                                  className="p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
                                >
                                  <ChevronUp size={24} className="text-slate-400 hover:text-green-400" />
                                </button>
                                <span className="font-bold text-lg my-1">{question.upvotes?.length || 0}</span>
                                <span className="text-xs text-slate-500">votes</span>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800/50">
                                      {question.category}
                                    </span>
                                    {question.isSolved && (
                                      <span className="flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-800/50">
                                        <CheckCircle size={12} />
                                        Solved
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm text-slate-500">{formatDate(question.createdAt)}</span>
                                </div>
                                
                                <h3 className="text-lg font-semibold mb-2 hover:text-cyan-400 cursor-pointer">
                                  {question.title}
                                </h3>
                                <p className="text-slate-300 mb-4 line-clamp-2">{question.description}</p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <MessageCircle size={18} className="text-slate-500" />
                                      <span className="text-slate-400">{question.answers?.length || 0} answers</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <Eye size={18} className="text-slate-500" />
                                      <span className="text-slate-400">{question.views || 0} views</span>
                                    </div>
                                    
                                    <div className="flex gap-1">
                                      {question.tags?.slice(0, 3).map((tag, index) => (
                                        <span key={index} className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => setShowReplyModal({ show: true, id: question._id, type: 'question' })}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 transition-all"
                                  >
                                    Answer
                                  </button>
                                </div>
                                
                                {/* Answers Preview */}
                                {question.answers && question.answers.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-slate-800/50">
                                    <div className="flex items-center gap-2 mb-3">
                                      <CheckCircle size={16} className="text-slate-500" />
                                      <span className="text-sm text-slate-500">
                                        {question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    <div className="space-y-3">
                                      {question.answers.slice(0, 1).map((answer, index) => (
                                        <div key={index} className="bg-slate-900/30 rounded-lg p-4">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs">
                                                {answer.userName?.charAt(0) || 'A'}
                                              </div>
                                              <span className="text-sm font-medium">{answer.userName}</span>
                                              {answer.isAccepted && (
                                                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400">
                                                  <Award size={10} />
                                                  Solution
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-xs text-slate-500">{formatDate(answer.createdAt)}</span>
                                          </div>
                                          <p className="text-sm text-slate-300 line-clamp-2">{answer.answer}</p>
                                          <div className="flex items-center gap-3 mt-2">
                                            <button className="text-xs text-slate-400 hover:text-green-400 flex items-center gap-1">
                                              <ThumbsUp size={12} />
                                              {answer.upvotes?.length || 0}
                                            </button>
                                            <button className="text-xs text-cyan-400 hover:text-cyan-300">
                                              View full answer
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                      {question.answers.length > 1 && (
                                        <button className="text-sm text-cyan-400 hover:text-cyan-300">
                                          View all {question.answers.length} answers
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )
                    )}
                  </>
                )}
              </div>

              {/* Pagination */}
              {(activeTab === 'feedback' ? feedbackPagination.pages : questionPagination.pages) > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (activeTab === 'feedback') {
                          setFeedbackPagination({ ...feedbackPagination, page: Math.max(1, feedbackPagination.page - 1) });
                        } else {
                          setQuestionPagination({ ...questionPagination, page: Math.max(1, questionPagination.page - 1) });
                        }
                      }}
                      disabled={(activeTab === 'feedback' ? feedbackPagination.page : questionPagination.page) === 1}
                      className="px-3 py-2 rounded-lg bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50"
                    >
                      Previous
                    </button>
                    
                    <span className="px-4 py-2 text-slate-400">
                      Page {activeTab === 'feedback' ? feedbackPagination.page : questionPagination.page} of {activeTab === 'feedback' ? feedbackPagination.pages : questionPagination.pages}
                    </span>
                    
                    <button
                      onClick={() => {
                        if (activeTab === 'feedback') {
                          setFeedbackPagination({ ...feedbackPagination, page: Math.min(feedbackPagination.pages, feedbackPagination.page + 1) });
                        } else {
                          setQuestionPagination({ ...questionPagination, page: Math.min(questionPagination.pages, questionPagination.page + 1) });
                        }
                      }}
                      disabled={(activeTab === 'feedback' ? feedbackPagination.page : questionPagination.page) === (activeTab === 'feedback' ? feedbackPagination.pages : questionPagination.pages)}
                      className="px-3 py-2 rounded-lg bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="lg:w-1/3">
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-[#0a0f1d]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-yellow-400" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-900/20 to-cyan-600/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20">
                        <MessageSquare size={20} className="text-cyan-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Give Feedback</p>
                        <p className="text-sm text-slate-400">Share your experience</p>
                      </div>
                    </div>
                    <Plus size={20} className="text-cyan-400 group-hover:rotate-90 transition-transform" />
                  </button>
                  
                  <button
                    onClick={() => setShowQuestionModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-900/20 to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <HelpCircle size={20} className="text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Ask Question</p>
                        <p className="text-sm text-slate-400">Get help from community</p>
                      </div>
                    </div>
                    <Plus size={20} className="text-purple-400 group-hover:rotate-90 transition-transform" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-900/20 to-green-600/10 border border-green-500/20 hover:border-green-500/40 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <TrendingUp size={20} className="text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">View Top Voted</p>
                        <p className="text-sm text-slate-400">See popular discussions</p>
                      </div>
                    </div>
                    <ExternalLink size={20} className="text-green-400" />
                  </button>
                </div>
              </div>

              {/* Category Stats */}
              {stats && (
                <div className="bg-[#0a0f1d]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-cyan-400" />
                    Category Breakdown
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Feedback Categories</p>
                      <div className="space-y-2">
                        {stats.feedback.byCategory.slice(0, 4).map((cat) => (
                          <div key={cat._id} className="flex items-center justify-between">
                            <span className="text-sm">{cat._id}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-cyan-500 rounded-full"
                                  style={{ width: `${(cat.count / stats.feedback.total) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-slate-400">{cat.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-800/50">
                      <p className="text-sm text-slate-400 mb-2">Question Categories</p>
                      <div className="space-y-2">
                        {stats.questions.byCategory.slice(0, 4).map((cat) => (
                          <div key={cat._id} className="flex items-center justify-between">
                            <span className="text-sm">{cat._id}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${cat.solvedCount > 0 ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                                {cat.solvedCount} solved
                              </span>
                              <span className="text-sm text-slate-400">{cat.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Community Guidelines */}
              <div className="bg-[#0a0f1d]/80 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-yellow-400" />
                  Community Guidelines
                </h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Be respectful and constructive in discussions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Search before posting to avoid duplicates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Mark solutions as accepted when answered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Vote helpful content to surface quality discussions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-br from-[#0a0f1d] to-[#050b16] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                      <MessageSquare size={24} className="text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">Share Your Feedback</h3>
                      <p className="text-sm text-slate-400">Help us improve SuperEmo</p>
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

              <form onSubmit={handleSubmitFeedback} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={feedbackForm.title}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Brief summary of your feedback"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Message *</label>
                  <textarea
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors min-h-[150px]"
                    placeholder="Detailed description of your feedback, suggestions, or issues..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                    <select
                      value={feedbackForm.category}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      {feedbackCategories.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                    <select
                      value={feedbackForm.priority}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, priority: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={feedbackForm.isAnonymous}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, isAnonymous: e.target.checked })}
                    className="w-4 h-4 rounded bg-white/5 border border-white/10"
                  />
                  <label htmlFor="anonymous" className="text-sm text-slate-400">
                    Post anonymously
                  </label>
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
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    Submit Feedback
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-br from-[#0a0f1d] to-[#050b16] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <HelpCircle size={24} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">Ask a Question</h3>
                      <p className="text-sm text-slate-400">Get help from the community</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQuestionModal(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitQuestion} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={questionForm.title}
                    onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="What do you need help with?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                  <textarea
                    value={questionForm.description}
                    onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 transition-colors min-h-[200px]"
                    placeholder="Provide as much detail as possible. Include steps you've tried, error messages, and what you're trying to achieve."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                    <select
                      value={questionForm.category}
                      onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      {questionCategories.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={questionForm.tags.join(', ')}
                      onChange={(e) => setQuestionForm({ ...questionForm, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="e.g., installation, error, setup"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
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
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    Post Question
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-gradient-to-br from-[#0a0f1d] to-[#050b16] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-emerald-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                      <MessageCircle size={24} className="text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">
                        {showReplyModal.type === 'feedback' ? 'Reply to Feedback' : 'Answer Question'}
                      </h3>
                      <p className="text-sm text-slate-400">Share your thoughts or solution</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReplyModal({ show: false, id: null, type: null })}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitReply} className="p-6">
                <textarea
                  value={replyForm.message}
                  onChange={(e) => setReplyForm({ message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-green-500 transition-colors min-h-[150px] mb-6"
                  placeholder={showReplyModal.type === 'feedback' 
                    ? "Write your reply here... Be constructive and helpful!" 
                    : "Write your answer here... Provide detailed explanation and solutions!"
                  }
                  required
                />

                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setShowReplyModal({ show: false, id: null, type: null })}
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
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    {showReplyModal.type === 'feedback' ? 'Post Reply' : 'Post Answer'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackCommunity;