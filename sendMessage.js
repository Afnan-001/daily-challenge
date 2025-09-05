// sendMessage.js
require('dotenv').config(); // Load environment variables
const { getSocket, isSocketConnected, startSocket } = require('./main')
const { delay } = require('@whiskeysockets/baileys')
const { draftDailyMessage } = require('./draftMessage')

// Use environment variable for group ID
const GROUP_ID = process.env.WHATSAPP_GROUP_ID;

// Validate that group ID is set
if (!GROUP_ID && require.main === module) {
  console.error('❌ FATAL: WHATSAPP_GROUP_ID environment variable is not set');
  process.exit(1);
}

async function waitForConnection(timeout = 30000) {
  const startTime = Date.now()
  while (!isSocketConnected() && (Date.now() - startTime) < timeout) {
    await delay(1000)
    console.log('Waiting for connection...')
  }
  
  if (!isSocketConnected()) {
    throw new Error('Connection timeout: Could not establish WhatsApp connection')
  }
}

async function sendGroupMessage(text) {
  try {
    if (!isSocketConnected()) {
      console.log('⚠️ Socket not connected. Waiting for connection...')
      await waitForConnection()
    }

    const sock = getSocket()
    await sock.sendMessage(GROUP_ID, { text })
    console.log(`✅ Message sent to group: ${text.substring(0, 50)}...`)
    return true;
  } catch (err) {
    console.error('❌ Failed to send message:', err.message)
    return false;
  }
}

async function sendDailyProblem() {
  try {
    const message = await draftDailyMessage();
    
    if (!message) {
      console.log('❌ No message to send (API failed)');
      return false;
    }
    
    return await sendGroupMessage(message);
  } catch (error) {
    console.error('Error in sendDailyProblem:', error);
    return false;
  }
}

// Run directly: node sendMessage.js --daily
if (require.main === module) {
  const run = async () => {
    try {
      await startSocket();
      await delay(5000); // Wait for connection

      if (process.argv[2] === '--daily') {
        const sent = await sendDailyProblem();
        console.log(sent ? '✅ Daily problem sent' : '❌ Daily problem failed');
        process.exit(sent ? 0 : 1);
      } else {
        const msg = process.argv[2] || 'Hello 👋';
        const sent = await sendGroupMessage(msg);
        process.exit(sent ? 0 : 1);
      }
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  };

  run();
}

module.exports = { sendGroupMessage, sendDailyProblem };