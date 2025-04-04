import cron from 'node-cron';
import axios from 'axios';

// Run every minute
export const startNotificationCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      await axios.post('http://localhost:5001/api/queues/check-notifications');
      console.log('Notification check completed');
    } catch (error) {
      console.error('Error in notification cron job:', error);
    }
  });
};