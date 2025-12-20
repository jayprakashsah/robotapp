// src/services/syncService.js
import { WEB_API } from './api';

export const syncPendingData = async () => {
  try {
    // Sync pending feedback
    const pendingFeedback = JSON.parse(localStorage.getItem('pending_feedback') || '[]');
    
    if (pendingFeedback.length > 0) {
      console.log(`Syncing ${pendingFeedback.length} pending feedback items...`);
      
      for (const feedback of pendingFeedback) {
        try {
          await WEB_API.post('/feedback', {
            ...feedback,
            synced: true,
            originalTimestamp: feedback.timestamp
          });
        } catch (error) {
          console.error('Failed to sync one feedback item:', error);
        }
      }
      
      localStorage.removeItem('pending_feedback');
      console.log('✅ Pending feedback synced successfully');
    }
    
    // Sync pending support tickets (if you add offline support)
    const pendingTickets = JSON.parse(localStorage.getItem('pending_tickets') || '[]');
    if (pendingTickets.length > 0) {
      console.log(`Syncing ${pendingTickets.length} pending support tickets...`);
      
      for (const ticket of pendingTickets) {
        try {
          await WEB_API.post('/support', {
            ...ticket,
            synced: true
          });
        } catch (error) {
          console.error('Failed to sync one ticket:', error);
        }
      }
      
      localStorage.removeItem('pending_tickets');
      console.log('✅ Pending tickets synced successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
};

// Call this when app starts or when connection is detected
export const initializeSync = () => {
  // Check if we're online
  if (navigator.onLine) {
    // Sync on app load after 2 seconds delay
    setTimeout(syncPendingData, 2000);
  }
  
  // Sync every 5 minutes if online
  setInterval(() => {
    if (navigator.onLine) {
      syncPendingData();
    }
  }, 5 * 60 * 1000);
  
  // Sync when coming back online
  window.addEventListener('online', () => {
    console.log('Connection restored, syncing data...');
    syncPendingData();
  });
  
  // Save pending data when going offline
  window.addEventListener('offline', () => {
    console.log('Connection lost, data will be saved locally');
  });
};