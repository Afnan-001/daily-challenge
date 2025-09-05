// gfgDailyProb.js
require('dotenv').config();
const axios = require('axios');

// Function to fetch GFG POTD
async function fetchGfgDaily() {
  try {
    console.log('🔍 Fetching GFG POTD...');
    
    // Use environment variable for API URL
    const apiUrl = process.env.GFG_API_URL;
    const res = await axios.get(apiUrl, { 
      timeout: parseInt(process.env.API_TIMEOUT) || 30000 
    });
    
    if (res.data && res.data.problem_name && res.data.problem_url) {
      console.log('✅ GFG POTD fetched successfully');
      return {
        success: true,
        data: {
          title: res.data.problem_name,
          link: res.data.problem_url,
        }
      };
    } else {
      throw new Error("GFG API response missing required fields");
    }
  } catch (err) {
    console.error("❌ Error fetching GFG POTD:", err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = { fetchGfgDaily };