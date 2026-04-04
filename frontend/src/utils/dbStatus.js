export const checkDatabaseStatus = async () => {
  try {
    const response = await fetch('https://sentient-lab-backend.onrender.com/api/health');
    const data = await response.json();
    
    if (data.database.status === 'connected') {
      console.log('✅ Database is connected and healthy');
      return true;
    } else {
      console.log('❌ Database is not connected');
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot reach backend server:', error.message);
    console.log('💡 Make sure:');
    console.log('1. Backend is running: npm run dev in robot-app-backend');
    console.log('2. MongoDB Atlas connection is correct in .env');
    console.log('3. Your IP is whitelisted in MongoDB Atlas');
    return false;
  }
};