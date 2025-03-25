const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Enable JSON parsing
app.use(express.json());

// API Configuration
const API_KEY = '1ac2ed277929a1456588';
const API_URL = 'https://api.keywordseverywhere.com/v1/keywords/analyze';

// Serve static files
app.use(express.static(path.join(__dirname)));

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API endpoint
app.get('/api/search', async (req, res) => {
    try {
        const keyword = req.query.keyword;
        console.log('Received search request for keyword:', keyword);

        if (!keyword) {
            console.log('No keyword provided');
            return res.status(400).json({ error: 'Keyword is required' });
        }

        // Make request to Keywords Everywhere API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                keywords: [keyword],
                country: "global",
                currency: "USD",
                source: "gkp",
                type: "trend"
            })
        });

        console.log('API response status:', response.status);
        const responseText = await response.text();
        console.log('API response body:', responseText);

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}: ${responseText}`);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse API response:', e);
            throw new Error('Invalid response from API');
        }

        console.log('Parsed API response:', data);

        if (!data || !data.keywords || !data.keywords[0]) {
            console.log('No data found in API response');
            return res.status(404).json({ error: 'No data available' });
        }

        const keyword_data = data.keywords[0];
        console.log('Keyword data:', keyword_data);

        // Extract trend data
        const trend = keyword_data.trend.split(',').map(Number);
        const volume = keyword_data.vol || trend[trend.length - 1];

        const result = {
            trend: trend,
            volume: volume
        };
        console.log('Sending response:', result);

        res.json(result);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch keyword data', 
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ 
        error: 'Server error', 
        details: err.message 
    });
});

// Function to start server
function startServer() {
    try {
        const server = app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

        server.on('error', (error) => {
            console.error('Server error:', error);
            if (error.code === 'EADDRINUSE') {
                console.log('Port is already in use. Retrying in 1 second...');
                setTimeout(() => {
                    server.close();
                    startServer();
                }, 1000);
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer(); 