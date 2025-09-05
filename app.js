// app.js
const { sendDailyProblem } = require('./sendMessage')
const { startSocket } = require('./main')

async function main() {
  console.log('🚀 Starting WhatsApp Bot...')
  
  // Start the socket
  await startSocket()
  
  // Wait for connection and send a message after 10 seconds
  setTimeout(async () => {
    await sendDailyProblem()
  }, 10000)
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main }