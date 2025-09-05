// main.js
const {
  default: makeWASocket,
  useMultiFileAuthState,
  Browsers,
  DisconnectReason,
  delay
} = require('@whiskeysockets/baileys')
const P = require('pino')
const QRCode = require('qrcode')

let sock = null
let isConnected = false

async function startSocket() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

    sock = makeWASocket({
      auth: state,
      logger: P({ level: 'error' }),
      browser: Browsers.ubuntu('Chrome'), // Changed to Ubuntu
      markOnlineOnConnect: false, // To avoid stopping phone notifications
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update
      
      if (qr) {
        console.log(await QRCode.toString(qr, { type: 'terminal', small: true }))
        console.log('Scan the QR code above with WhatsApp')
      }

      if (connection === 'open') {
        isConnected = true
        console.log('✅ Connected to WhatsApp!')
      } else if (connection === 'close') {
        isConnected = false
        const reason = (lastDisconnect?.error)?.output?.statusCode
        
        if (reason === DisconnectReason.loggedOut) {
          console.error('❌ Logged out. Delete auth_info_baileys and re-scan QR.')
        } else {
          console.log('🔄 Connection closed, reconnecting in 3s...')
          await delay(3000)
          startSocket()
        }
      }
    })

    return sock
  } catch (error) {
    console.error('Error starting socket:', error)
    // Retry after delay
    await delay(5000)
    return startSocket()
  }
}

function getSocket() {
  return sock
}

function isSocketConnected() {
  return isConnected && sock !== null
}

// Export but don't auto-start - let the consumer control when to start
module.exports = { getSocket, isSocketConnected, startSocket }