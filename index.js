const express = require('express');
const cors = require('cors');
const handleProxy = require('./proxy');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API route
app.post('/api/proxy', handleProxy);

// Serve HTML interface
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto View Sender</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 18px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }
        .result {
            margin-top: 30px;
            padding: 20px;
            border-radius: 5px;
            display: none;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .result-item {
            padding: 10px;
            margin: 10px 0;
            border-radius: 3px;
            background: rgba(255,255,255,0.8);
        }
        .success-item {
            background: #f0f8f0;
        }
        .error-item {
            background: #fff0f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Auto View Sender</h1>
        
        <form id="viewForm">
            <div class="form-group">
                <label for="url">Target URL:</label>
                <input 
                    type="url" 
                    id="url" 
                    placeholder="https://example.com" 
                    required
                >
            </div>

            <div class="form-group">
                <label for="count">Number of Views (1-100):</label>
                <input 
                    type="number" 
                    id="count" 
                    value="10"
                    min="1" 
                    max="100"
                    required
                >
            </div>

            <div class="form-group">
                <label for="delay">Delay between views (ms):</label>
                <input 
                    type="number" 
                    id="delay" 
                    value="1000"
                    min="500" 
                    max="10000"
                    required
                >
            </div>

            <button type="submit" id="submitBtn">
                Start Sending Views
            </button>
        </form>

        <div id="result" class="result"></div>
    </div>

    <script>
        const form = document.getElementById('viewForm');
        const resultDiv = document.getElementById('result');
        const submitBtn = document.getElementById('submitBtn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const url = document.getElementById('url').value;
            const count = document.getElementById('count').value;
            const delay = document.getElementById('delay').value;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending Views...';
            resultDiv.style.display = 'none';

            try {
                const response = await fetch('/api/proxy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        url: url,
                        count: parseInt(count),
                        delay: parseInt(delay)
                    }),
                });

                const data = await response.json();
                
                if (data.success) {
                    resultDiv.className = 'result success';
                    resultDiv.innerHTML = \`
                        <h3>✅ Success!</h3>
                        <p><strong>Target:</strong> \${data.target}</p>
                        <p><strong>Total Attempts:</strong> \${data.totalAttempts}</p>
                        
                        <h4>Results:</h4>
                        \${data.results.map(item => \`
                            <div class="result-item \${item.status === 'success' ? 'success-item' : 'error-item'}">
                                <strong>Attempt \${item.attempt}:</strong> \${item.status}
                                \${item.status === 'success' ? \`
                                    <div>Status: \${item.statusCode} | Title: \${item.title}</div>
                                \` : \`
                                    <div>Error: \${item.error}</div>
                                \`}
                                <small>Time: \${new Date(item.timestamp).toLocaleTimeString()}</small>
                            </div>
                        \`).join('')}
                    \`;
                } else {
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = \`
                        <h3>❌ Error</h3>
                        <p>Error: \${data.error}</p>
                    \`;
                }
                
                resultDiv.style.display = 'block';

            } catch (error) {
                resultDiv.className = 'result error';
                resultDiv.innerHTML = \`
                    <h3>❌ Error</h3>
                    <p>Error: \${error.message}</p>
                \`;
                resultDiv.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Start Sending Views';
            }
        });
    </script>
</body>
</html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Proxy API available at http://localhost:${PORT}/api/proxy`);
});
