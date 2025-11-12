const axios = require('axios');
const cheerio = require('cheerio');

async function handleProxy(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, count = 1, delay = 1000 } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      try {
        // Add random delay between requests
        if (i > 0) {
          await new Promise(resolve => 
            setTimeout(resolve, delay + Math.random() * 2000)
          );
        }

        // Make request to target URL
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        // Parse HTML and extract title
        const $ = cheerio.load(response.data);
        const title = $('title').text() || 'No title found';

        results.push({
          attempt: i + 1,
          status: 'success',
          statusCode: response.status,
          title: title,
          timestamp: new Date().toISOString()
        });

        console.log(`View ${i + 1} sent to: ${url}`);

      } catch (error) {
        results.push({
          attempt: i + 1,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.status(200).json({
      success: true,
      target: url,
      totalAttempts: count,
      results: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = handleProxy;
