// leetcodeDailyProb.js
require('dotenv').config();
const axios = require('axios');

// Function to fetch LeetCode POTD
async function fetchLeetCodeDaily() {
  try {
    console.log('🔍 Fetching LeetCode POTD...');
    
    // Use environment variable for API URL
    const apiUrl = process.env.LEETCODE_API_URL;
    const res = await axios.get(apiUrl, { 
      timeout: parseInt(process.env.API_TIMEOUT) || 30000 
    });
    
    if (res.data && res.data.questionLink && res.data.questionTitle) {
      console.log('✅ LeetCode POTD fetched successfully');
      return {
        success: true,
        data: {
          title: res.data.questionTitle,
          link: res.data.questionLink
        }
      };
    } else {
      throw new Error("'questionLink' or 'questionTitle' not found in response");
    }
  } catch (err) {
    console.error("❌ Error fetching LeetCode POTD:", err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = { fetchLeetCodeDaily };