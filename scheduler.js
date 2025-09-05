// scheduler.js
require('dotenv').config();
const cron = require('node-cron');
const { startSocket } = require('./main');
const { sendDailyProblem } = require('./sendMessage');
const { delay } = require('@whiskeysockets/baileys');

class DailyScheduler {
  constructor() {
    this.isRunning = false;
    this.scheduledTask = null;
    // Get schedule from environment variables
    this.cronSchedule = process.env.SCHEDULE_CRON;
    this.timezone = process.env.SCHEDULE_TIMEZONE;
  }

  // Schedule the daily task
  scheduleDailyTask() {
    console.log(`⏰ Scheduling daily task with cron: ${this.cronSchedule} (${this.timezone})`);
    
    this.scheduledTask = cron.schedule(this.cronSchedule, async () => {
      await this.executeDailyTask();
    }, {
      scheduled: true,
      timezone: this.timezone
    });

    console.log('✅ Daily task scheduled');
    
    // Also execute immediately if it's after scheduled time (for testing)
    this.executeIfTime();
  }

  // Execute the daily task
  async executeDailyTask() {
    if (this.isRunning) {
      console.log('⚠️ Daily task is already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting daily task execution...');
    console.log('📅 Date:', new Date().toLocaleString('en-IN', { timeZone: this.timezone }));

    try {
      // Start socket connection
      await startSocket();
      console.log('✅ Socket started successfully');

      // Wait for connection
      console.log('⏳ Waiting for WhatsApp connection...');
      await delay(parseInt(process.env.CONNECTION_DELAY) || 10000); // Wait for connection

      // Send daily problem
      const success = await sendDailyProblem();
      
      if (success) {
        console.log('✅ Daily task completed successfully');
      } else {
        console.log('❌ Daily task completed with errors');
      }
    } catch (error) {
      console.error('💥 Error in daily task execution:', error.message);
    } finally {
      this.isRunning = false;
      console.log('🏁 Daily task execution finished');
    }
  }

  // Execute immediately if current time is after scheduled time (for testing/initial setup)
  async executeIfTime() {
    if (process.env.SKIP_IMMEDIATE_EXECUTION === 'true') {
      console.log('⏩ Skipping immediate execution (SKIP_IMMEDIATE_EXECUTION=true)');
      return;
    }

    const now = new Date();
    const [scheduledHour, scheduledMinute] = this.cronSchedule.split(' ')[1].split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // If it's after scheduled time, execute immediately
    if (currentHour > scheduledHour || (currentHour === scheduledHour && currentMinute >= scheduledMinute)) {
      console.log('⏰ Current time is after scheduled time, executing task now...');
      await this.executeDailyTask();
    }
  }

  // Stop the scheduler
  stop() {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      console.log('⏹️ Scheduler stopped');
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      isScheduled: this.scheduledTask !== null,
      cronSchedule: this.cronSchedule,
      timezone: this.timezone
    };
  }
}

// Create singleton instance
const scheduler = new DailyScheduler();

module.exports = scheduler;