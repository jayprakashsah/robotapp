// frontend/src/services/feedbackService.js
import { WEB_API } from './api';

export const feedbackService = {
  // Submit feedback
  submitFeedback: async (feedbackData) => {
    try {
      const response = await WEB_API.post('/feedback/submit', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Get user's feedback
  getMyFeedback: async () => {
    try {
      const response = await WEB_API.get('/feedback/my-feedback');
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  // Get single feedback details
  getFeedbackDetails: async (id) => {
    try {
      const response = await WEB_API.get(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback details:', error);
      throw error;
    }
  },

  // Admin: Get all feedback
  getAllFeedback: async (params = {}) => {
    try {
      const response = await WEB_API.get('/feedback/admin/all', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      throw error;
    }
  },

  // Admin: Update feedback status
  updateFeedbackStatus: async (id, statusData) => {
    try {
      const response = await WEB_API.patch(`/feedback/admin/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw error;
    }
  },

  // Admin: Add note to feedback
  addFeedbackNote: async (id, noteData) => {
    try {
      const response = await WEB_API.post(`/feedback/admin/${id}/note`, noteData);
      return response.data;
    } catch (error) {
      console.error('Error adding feedback note:', error);
      throw error;
    }
  },

  // Admin: Get statistics
  getFeedbackStats: async () => {
    try {
      const response = await WEB_API.get('/feedback/stats/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      throw error;
    }
  }
};

export default feedbackService;