const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Helper function to generate dates for the last n months
function generateDates(months) {
    const dates = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
}

// Helper function to generate trend values with realistic patterns
function generateTrendData(startValue, endValue, months) {
    const values = [];
    const dates = generateDates(months);
    
    // Calculate growth pattern
    const growthRate = Math.pow(endValue / startValue, 1 / (months - 1));
    
    for (let i = 0; i < months; i++) {
        // Base exponential growth
        const baseValue = startValue * Math.pow(growthRate, i);
        
        // Add some random variation (±10%)
        const variation = baseValue * 0.1 * (Math.random() - 0.5);
        
        // Ensure we don't go below startValue
        values.push(Math.max(Math.round(baseValue + variation), startValue));
    }
    
    return {
        dates: dates,
        values: values
    };
}

// Sample trend data with more realistic patterns
const trendData = {
    trends: [
        {
            keyword: "AI Robot",
            volume: 74000,
            growth: 1760,
            description: "Artificial Intelligence powered robots and automation systems gaining significant interest in Web3 applications.",
            chartData: generateTrendData(5000, 74000, 48)
        },
        {
            keyword: "Robot AI Assistant",
            volume: 40500,
            growth: 1700,
            description: "AI-powered virtual assistants and chatbots revolutionizing customer interactions in the Web3 space.",
            chartData: generateTrendData(3000, 40500, 48)
        },
        {
            keyword: "MONAD",
            volume: 74000,
            growth: 1760,
            description: "A high-performance blockchain designed for building scalable decentralized applications with improved throughput.",
            chartData: generateTrendData(5000, 74000, 48)
        },
        {
            keyword: "PUMP",
            volume: 40500,
            growth: 1700,
            description: "The community-driven pump fun token designed to reward holders and create excitement in trading.",
            chartData: generateTrendData(3000, 40500, 48)
        },
        {
            keyword: "OPENSEA",
            volume: 246000,
            growth: -94.5,
            description: "Leading NFT marketplace platform with significant market presence.",
            chartData: generateTrendData(4500000, 246000, 48)
        }
    ]
};

// Search endpoint with fuzzy matching
app.get('/api/trend-data', (req, res) => {
    const { keyword } = req.query;
    
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword parameter is required' });
    }
    
    // Case-insensitive fuzzy search
    const searchResults = trendData.trends.filter(trend => 
        trend.keyword.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Generate new trends if no exact matches found
    if (searchResults.length === 0) {
        const baseVolume = Math.floor(Math.random() * 50000) + 10000;
        const growth = Math.floor(Math.random() * 2000) + 500;
        
        const newTrend = {
            keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            volume: baseVolume,
            growth: growth,
            description: `Emerging trend in the Web3 space related to ${keyword}.`,
            chartData: generateTrendData(baseVolume / 10, baseVolume, 48)
        };
        
        searchResults.push(newTrend);
    }
    
    res.json({ trends: searchResults });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 