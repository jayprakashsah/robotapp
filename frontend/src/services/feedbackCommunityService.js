// frontend/src/services/feedbackCommunityService.js
import { WEB_API } from './api';

export const communityService = {
    // Feedback endpoints
    getFeedback: async (params = {}) => {
        try {
            const response = await WEB_API.get('/community/feedback', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching feedback:', error);
            throw error;
        }
    },
    
    submitFeedback: async (feedbackData) => {
        try {
            const response = await WEB_API.post('/community/feedback', feedbackData);
            return response.data;
        } catch (error) {
            console.error('Error submitting feedback:', error);
            throw error;
        }
    },
    
    addReply: async (feedbackId, replyData) => {
        try {
            const response = await WEB_API.post(`/community/feedback/${feedbackId}/reply`, replyData);
            return response.data;
        } catch (error) {
            console.error('Error adding reply:', error);
            throw error;
        }
    },
    
    voteFeedback: async (feedbackId, voteType) => {
        try {
            const response = await WEB_API.post(`/community/feedback/${feedbackId}/vote`, { voteType });
            return response.data;
        } catch (error) {
            console.error('Error voting on feedback:', error);
            throw error;
        }
    },
    
    // Question endpoints
    getQuestions: async (params = {}) => {
        try {
            const response = await WEB_API.get('/community/questions', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }
    },
    
    askQuestion: async (questionData) => {
        try {
            const response = await WEB_API.post('/community/questions', questionData);
            return response.data;
        } catch (error) {
            console.error('Error asking question:', error);
            throw error;
        }
    },
    
    answerQuestion: async (questionId, answerData) => {
        try {
            const response = await WEB_API.post(`/community/questions/${questionId}/answers`, answerData);
            return response.data;
        } catch (error) {
            console.error('Error answering question:', error);
            throw error;
        }
    },
    
    acceptAnswer: async (questionId, answerId) => {
        try {
            const response = await WEB_API.patch(`/community/questions/${questionId}/answers/${answerId}/accept`);
            return response.data;
        } catch (error) {
            console.error('Error accepting answer:', error);
            throw error;
        }
    },
    
    voteQuestion: async (questionId, voteType) => {
        try {
            const response = await WEB_API.post(`/community/question/${questionId}/vote`, { voteType });
            return response.data;
        } catch (error) {
            console.error('Error voting on question:', error);
            throw error;
        }
    },
    
    voteAnswer: async (answerId, voteType) => {
        try {
            const response = await WEB_API.post(`/community/answer/${answerId}/vote`, { voteType });
            return response.data;
        } catch (error) {
            console.error('Error voting on answer:', error);
            throw error;
        }
    },
    
    getStats: async () => {
        try {
            const response = await WEB_API.get('/community/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    }
};

export default communityService;