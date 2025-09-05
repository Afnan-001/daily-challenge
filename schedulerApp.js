// schedulerApp.js
require('dotenv').config();
const scheduler = require('./scheduler');

// Graceful shutdown handling
function setupGracefulShutdown() {
  process.on('SIGINT', () => {
    console.log('\n👋 Received SIGINT. Shutting down scheduler gracefully...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n👋 Received SIGTERM. Shutting down scheduler gracefully...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    scheduler.stop();
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    scheduler.stop();
    process.exit(1);
  });
}

async function main() {
  console.log('🚀 Starting WhatsApp Bot Scheduler...');
  console.log('⏰ Will run daily at 6:00 AM');
  
  setupGracefulShutdown();
  
  try {
    // Start the scheduler
    scheduler.scheduleDailyTask();
    
    console.log('✅ Scheduler started successfully');
    console.log('🤖 Scheduler is running. Press Ctrl+C to exit.');
    
    // Keep the process alive
    // You can add additional logic here if needed
    
  } catch (error) {
    console.error('❌ Failed to start scheduler:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}