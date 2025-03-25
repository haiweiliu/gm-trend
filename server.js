const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mc = require('minecraft-protocol');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs').promises;

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3001;
const KEYWORDS_API_KEY = process.env.KEYWORD_EVERYWHERE_API_KEY;
const DATA_FILE = path.join(__dirname, 'data', 'trends.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir);
    }
}

// Initialize trend data store
let trendDataStore = {
    "monad": {
        name: "MONAD",
        description: "A high-performance blockchain designed for building scalable decentralized applications with improved throughput and lower fees. MONAD differentiates itself by offering an AI-driven approach that simplifies the development process, making it accessible to users without technical expertise.",
        monthlyData: {
            "2021": [4000, 4100, 4200, 4150, 4300, 4250, 4400, 4350, 4500, 4600, 4700, 4800],
            "2022": [5000, 6000, 7000, 8000, 10000, 12000, 15000, 18000, 20000, 22000, 24000, 25000],
            "2023": [26000, 28000, 30000, 32000, 33000, 34000, 35000, 33000, 34000, 35000, 38000, 40000],
            "2024": [42000, 45000, 50000, 55000, 60000, 65000, 68000, 70000, 72000, 74000, null, null],
            "2025": [null, null, null, null, null, null, null, null, null, null, null, null]
        },
        currentVolume: 74000,
        growth: 1760,
        competition: "medium",
        cpc: 2.45,
        lastUpdated: new Date().toISOString()
    },
    "pump": {
        name: "PUMP",
        description: "The community-driven pump fun token designed to reward holders and create excitement in trading.",
        monthlyData: {
            "2021": [2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100],
            "2022": [3200, 4000, 5000, 6000, 8000, 10000, 12000, 15000, 18000, 20000, 22000, 25000],
            "2023": [28000, 30000, 32000, 34000, 35000, 36000, 37000, 38000, 39000, 40000, 41000, 42000],
            "2024": [43000, 44000, 45000, 46000, 47000, 48000, 49000, 50000, null, null, null, null],
            "2025": [null, null, null, null, null, null, null, null, null, null, null, null]
        },
        currentVolume: 40500,
        growth: 1700,
        competition: "high",
        cpc: 1.85,
        lastUpdated: new Date().toISOString()
    },
    "opensea": {
        name: "OPENSEA",
        description: "A leading NFT marketplace that facilitates the trading of digital collectibles, art, and other blockchain-based assets. OPENSEA provides a user-friendly platform for creators and collectors to discover, buy, sell and showcase unique digital items.",
        monthlyData: {
            "2020": [50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000, 150000],
            "2021": [200000, 250000, 300000, 400000, 500000, 800000, 1200000, 1800000, 2500000, 3000000, 3500000, 4000000],
            "2022": [4500000, 4000000, 3500000, 3000000, 2500000, 2000000, 1500000, 1000000, 800000, 600000, 500000, 400000],
            "2023": [350000, 300000, 280000, 270000, 260000, 250000, 248000, 247000, 246000, 246000, 246000, 246000],
            "2024": [246000, 246000, 246000, null, null, null, null, null, null, null, null, null],
            "2025": [null, null, null, null, null, null, null, null, null, null, null, null]
        },
        currentVolume: 246000,
        growth: -94.5, // Calculated from peak of ~4.5M to current 246K
        competition: "high",
        cpc: 3.25,
        lastUpdated: new Date().toISOString()
    }
    // Add more keywords with their data...
};

// Load trend data from file
async function loadTrendData() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DATA_FILE, 'utf8');
        trendDataStore = JSON.parse(data);
        console.log('Loaded trend data from file');
    } catch (error) {
        console.log('No existing trend data file, using default data');
        await saveTrendData();
    }
}

// Save trend data to file
async function saveTrendData() {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(trendDataStore, null, 2));
        console.log('Saved trend data to file');
    } catch (error) {
        console.error('Error saving trend data:', error);
    }
}

// Update trend data from API
async function updateTrendData(keyword) {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://api.keywordseverywhere.com/v1/get_keyword_data',
            headers: {
                'Authorization': `Bearer ${KEYWORDS_API_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                keywords: [keyword],
                country: 'us',
                currency: 'USD',
                dataSource: 'gkp'
            }
        });

        const apiData = response.data.data[0];
        const transformedData = transformApiData(apiData);
        trendDataStore[keyword] = {
            ...transformedData,
            lastUpdated: new Date().toISOString()
        };

        await saveTrendData();
        return transformedData;
    } catch (error) {
        console.error('Error updating trend data:', error);
        throw error;
    }
}

// Check if data needs update (older than 24 hours)
function needsUpdate(lastUpdated) {
    if (!lastUpdated) return true;
    const lastUpdate = new Date(lastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    return hoursSinceUpdate >= 24;
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Get trend data endpoint
app.get('/api/trend/:keyword', async (req, res) => {
    try {
        const { keyword } = req.params;
        const data = trendDataStore[keyword];

        if (!data || needsUpdate(data.lastUpdated)) {
            const updatedData = await updateTrendData(keyword);
            return res.json(updatedData);
        }

        res.json(data);
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch trend data' });
    }
});

// Get all trends
app.get('/api/trends', (req, res) => {
    const trends = Object.entries(trendDataStore).map(([key, data]) => ({
        id: key,
        name: data.name,
        currentVolume: data.currentVolume,
        growth: data.growth,
        description: data.description,
        competition: data.competition,
        cpc: data.cpc
    }));
    
    res.json(trends);
});

function transformApiData(apiData) {
    return {
        name: apiData.keyword,
        currentVolume: apiData.vol,
        growth: calculateGrowth(apiData.trend || []),
        competition: apiData.competition,
        cpc: apiData.cpc,
        description: '',
        monthlyData: createMonthlyDataFromTrend(apiData.trend || [])
    };
}

function calculateGrowth(trendData) {
    if (!trendData || trendData.length < 2) return 0;
    const oldValue = trendData[0];
    const newValue = trendData[trendData.length - 1];
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
}

function createMonthlyDataFromTrend(trend) {
    const currentYear = new Date().getFullYear();
    const monthlyData = {};
    
    for (let year = currentYear - 4; year <= currentYear + 1; year++) {
        monthlyData[year] = Array(12).fill(null);
    }
    
    trend.forEach((value, index) => {
        const year = Math.floor(index / 12) + (currentYear - 4);
        const month = index % 12;
        if (monthlyData[year]) {
            monthlyData[year][month] = value;
        }
    });
    
    return monthlyData;
}

// Initialize data on startup
loadTrendData().catch(console.error);

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 