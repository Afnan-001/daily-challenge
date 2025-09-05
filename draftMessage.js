// draftMessage.js
require('dotenv').config();
const { fetchLeetCodeDaily } = require('./leetcodeDailyProb');
const { fetchGfgDaily } = require('./gfgDailyProb');

// Function to get formatted current date
function getCurrentDate() {
  const now = new Date();
  const options = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    timeZone: process.env.TIMEZONE || 'Asia/Kolkata' // Make timezone configurable
  };
  return now.toLocaleDateString('en-US', options);
}

// Function to draft the complete message
async function draftDailyMessage() {
  const currentDate = getCurrentDate();
  
  try {
    // Fetch both LeetCode and GFG POTD with timeout
    const [leetcodeResult, gfgResult] = await Promise.all([
      fetchLeetCodeDaily(),
      fetchGfgDaily()
    ]);
    
    // Check if both APIs succeeded
    const leetcodeSuccess = leetcodeResult?.success;
    const gfgSuccess = gfgResult?.success;
    
    if (!leetcodeSuccess && !gfgSuccess) {
      console.log("❌ Both LeetCode and GFG APIs failed");
      return null;
    }
    
    if (!leetcodeSuccess) {
      console.log("⚠️ LeetCode API failed, sending only GFG problem");
      return `📅 Daily Problem - ${currentDate}\n\n🟢 GFG POTD:\n${gfgResult.data.title}\n🔗 ${gfgResult.data.link}`;
    }
    
    if (!gfgSuccess) {
      console.log("⚠️ GFG API failed, sending only LeetCode problem");
      return `📅 Daily Problem - ${currentDate}\n\n🟠 LeetCode POTD:\n${leetcodeResult.data.title}\n🔗 ${leetcodeResult.data.link}`;
    }
    
    // Both succeeded - construct the full message
    const message = `📅 Daily Problem - ${currentDate}\n\n🟠 *LeetCode POTD*:\n${leetcodeResult.data.title}\n🔗 ${leetcodeResult.data.link}\n\n🟢 *GFG POTD*:\n${gfgResult.data.title}\n🔗 ${gfgResult.data.link}`;

    return message;
    
  } catch (error) {
    console.error('Unexpected error in draftDailyMessage:', error);
    return null;
  }
}

// Export functions
module.exports = {
  draftDailyMessage,
  getCurrentDate
};

// Run directly for testing
if (require.main === module) {
  draftDailyMessage()
    .then(message => {
      if (message) {
        console.log('📝 Drafted Message:');
        console.log(message);
      } else {
        console.log('❌ No message drafted due to API failure');
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('Error drafting message:', error);
      process.exit(1);
    });
}