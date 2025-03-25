const fs = require('fs');
const path = require('path');

// Read data files
const similarwebData = JSON.parse(fs.readFileSync('data/similarweb_cex_mar25.json', 'utf8'));
const keywordData = JSON.parse(fs.readFileSync('data/keyworld_cex_mar25.json', 'utf8'));

// Helper function to format numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Helper function to format duration
function formatDuration(duration) {
    return duration.replace('00:', '');
}

// Helper function to determine trend status and position
function getTrendStatus(trendingPercentage) {
    const percentage = parseFloat(trendingPercentage);
    if (percentage >= 50) {
        return { status: 'EXPLODING', position: '90%', class: 'trend-exploding' };
    } else if (percentage >= 20) {
        return { status: 'PEAKED', position: '70%', class: 'trend-peaked' };
    } else if (percentage >= -10) {
        return { status: 'REGULAR', position: '40%', class: 'trend-regular' };
    } else {
        return { status: 'DECLINING', position: '10%', class: 'trend-declining' };
    }
}

// Helper function to get exchange description
function getExchangeDescription(name) {
    const descriptions = {
        'binance': 'Leading global cryptocurrency exchange offering a wide range of trading services.',
        'coinbase': 'US-based cryptocurrency exchange known for its user-friendly interface and security.',
        'kraken': 'Established cryptocurrency exchange with advanced trading features and strong security.',
        'kucoin': 'Global crypto exchange platform known for listing emerging cryptocurrencies.',
        'okx': 'Comprehensive cryptocurrency platform offering spot, futures, and DeFi services.',
        'bybit': 'Fast-growing crypto exchange specializing in cryptocurrency derivatives trading.',
        'htx': 'Global digital asset trading platform with comprehensive financial services.',
        'gate.io': 'Cryptocurrency exchange platform known for its wide selection of altcoins.',
        'mexc': 'Digital asset trading platform with a focus on emerging markets.',
        'bitget': 'Cryptocurrency exchange specializing in derivatives and copy trading.',
        'upbit': 'South Korea\'s largest cryptocurrency exchange with strong local presence.',
        'bithumb': 'Major South Korean cryptocurrency exchange with high trading volumes.',
        'bitmart': 'Global digital asset trading platform with multi-language support.',
        'whitebit': 'European cryptocurrency exchange with advanced trading features.',
        'crypto.com': 'All-in-one cryptocurrency platform with exchange, wallet, and card services.',
        'bitpanda': 'European digital investment platform for cryptocurrencies and other assets.',
        'ascendex': 'Digital asset exchange offering spot, futures, and margin trading.',
        'bingx': 'Social cryptocurrency trading platform with copy trading features.',
        'bullx': 'Emerging cryptocurrency exchange focusing on innovative trading products.',
        'pump.fun': 'New generation cryptocurrency trading platform with gamified features.',
        'jupiter': 'Decentralized exchange aggregator on the Solana blockchain.'
    };
    return descriptions[name.toLowerCase()] || `${name} - Cryptocurrency Exchange Platform`;
}

// Process each exchange
similarwebData.forEach(exchange => {
    const name = exchange.name.split('.')[0].toLowerCase();
    let searchName = name;
    
    // Handle special cases
    if (name === 'gate') searchName = 'gate io';
    if (name === 'pump') searchName = 'pump fun';
    if (name === 'jup') searchName = 'jupiter';
    if (name === 'crypto') searchName = 'crypto com';
    
    const keywordInfo = keywordData.find(k => k.Keyword.toLowerCase() === searchName);
    
    if (!keywordInfo) {
        console.log(`No keyword data found for ${name}`);
        return;
    }

    const searchVolume = parseInt(keywordInfo['Search Volume (Global)'].replace(/,/g, ''));
    const monthlyVisits = exchange.totalVisits;
    const trendStatus = getTrendStatus(keywordInfo['Trending %'].replace('%', ''));
    const description = getExchangeDescription(name);

    const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name.toUpperCase()} - Exchange Analysis | GM Trend®</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js"></script>
    <style>
        :root {
            --bg-primary: #F9FAFB;
            --bg-secondary: #FFFFFF;
            --bg-card: #FFFFFF;
            --text-primary: #111827;
            --text-secondary: #6B7280;
            --border-color: rgba(0, 0, 0, 0.1);
            --hover-bg: rgba(0, 0, 0, 0.02);
            --button-bg: rgba(0, 0, 0, 0.03);
            --card-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            --grid-color: rgba(0, 0, 0, 0.05);
            --tooltip-bg: rgba(255, 255, 255, 0.95);
            --tooltip-text: #111827;
            --tooltip-border: rgba(59, 130, 246, 0.2);
            --primary-color: #3B82F6;
            --secondary-color: #60A5FA;
            --trend-declining: #EF4444;
            --trend-regular: #F59E0B;
            --trend-peaked: #4F46E5;
            --trend-exploding: #3B82F6;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
        }
        
        .wallet-card {
            background-color: var(--bg-card);
            border-radius: 0.75rem;
            box-shadow: var(--card-shadow);
            transition: all 0.3s ease;
            border: 1px solid var(--border-color);
        }
        
        .wallet-card:hover {
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            transform: translateY(-2px);
        }
        
        .trend-meter {
            width: 100%;
            height: 8px;
            background: linear-gradient(to right, var(--trend-declining), var(--trend-regular), var(--trend-peaked), var(--trend-exploding));
            border-radius: 4px;
            position: relative;
        }
        
        .trend-pointer {
            position: absolute;
            top: -14px;
            width: 12px;
            height: 12px;
            transform: rotate(45deg);
            background-color: var(--text-primary);
            border: 2px solid var(--bg-card);
            margin-left: -6px;
            left: ${trendStatus.position};
        }
        
        .trend-badge {
            display: inline-flex;
            align-items: center;
            border-radius: 9999px;
            padding: 4px 10px;
            font-weight: 600;
            font-size: 0.75rem;
        }
        
        .trend-${trendStatus.class} {
            background-color: rgba(var(--${trendStatus.class}-rgb), 0.1);
            color: var(--${trendStatus.class});
        }
    </style>
</head>
<body>
    <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="wallet-card p-8 mb-8">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center space-x-6">
                        <img src="${exchange.icon}" alt="${name} logo" class="w-16 h-16 rounded-xl shadow-lg">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">${name.toUpperCase()}</h1>
                            <p class="text-gray-500 mt-1">${description}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="trend-badge ${trendStatus.class}">
                            <i class="fas ${trendStatus.status === 'DECLINING' ? 'fa-arrow-down' : 'fa-arrow-up'} mr-1"></i>
                            ${trendStatus.status}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div class="wallet-card p-6">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Monthly Visits</h3>
                        <p class="text-2xl font-bold">${formatNumber(monthlyVisits)}</p>
                        <div class="mt-2">
                            <span class="text-sm text-gray-500">Global Rank: #${exchange.globalRank}</span>
                        </div>
                    </div>
                    <div class="wallet-card p-6">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Search Volume</h3>
                        <p class="text-2xl font-bold">${formatNumber(searchVolume)}</p>
                        <div class="mt-2">
                            <span class="text-sm text-gray-500">CPC: ${keywordInfo['CPC (Global)']}</span>
                        </div>
                    </div>
                    <div class="wallet-card p-6">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Engagement</h3>
                        <p class="text-2xl font-bold">${formatDuration(exchange.avgVisitDuration)}</p>
                        <div class="mt-2">
                            <span class="text-sm text-gray-500">Avg. Visit Duration</span>
                        </div>
                    </div>
                    <div class="wallet-card p-6">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Bounce Rate</h3>
                        <p class="text-2xl font-bold">${(exchange.bounceRate * 100).toFixed(1)}%</p>
                        <div class="mt-2">
                            <span class="text-sm text-gray-500">Pages/Visit: ${exchange.pagesPerVisit}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="wallet-card p-6">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Top Countries</h3>
                        <div class="space-y-4">
                            ${exchange.topCountries.map(country => `
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-medium">${country.countryAlpha2Code}</span>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm font-semibold">${(country.visitsShare * 100).toFixed(1)}%</span>
                                        <span class="text-xs ${country.visitsShareChange > 0 ? 'text-green-500' : 'text-red-500'}">
                                            ${(country.visitsShareChange * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="wallet-card p-6">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Traffic Sources</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium">Direct</span>
                                <span class="text-sm font-semibold">${(exchange.trafficSources.directVisitsShare * 100).toFixed(1)}%</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium">Search</span>
                                <span class="text-sm font-semibold">${((exchange.trafficSources.organicSearchVisitsShare + exchange.trafficSources.paidSearchVisitsShare) * 100).toFixed(1)}%</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium">Referral</span>
                                <span class="text-sm font-semibold">${(exchange.trafficSources.referralVisitsShare * 100).toFixed(1)}%</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-medium">Social</span>
                                <span class="text-sm font-semibold">${(exchange.trafficSources.socialNetworksVisitsShare * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8">
                    <div class="wallet-card p-6">
                        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Trend Analysis</h3>
                        <div class="trend-meter mb-8">
                            <div class="trend-pointer"></div>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="font-medium text-gray-500">Current Status:</span>
                                <span class="ml-2 font-semibold">${trendStatus.status}</span>
                            </div>
                            <div>
                                <span class="font-medium text-gray-500">Trend Change:</span>
                                <span class="ml-2 font-semibold ${keywordInfo['Trending %'].startsWith('-') ? 'text-red-500' : 'text-green-500'}">${keywordInfo['Trending %']}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Initialize tooltips
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            tippy(element, {
                content: element.getAttribute('data-tooltip'),
                theme: 'custom'
            });
        });
    </script>
</body>
</html>`;

    // Write the file
    fs.writeFileSync(`cex/${name}.html`, template);
    console.log(`Updated ${name}.html`);
});

console.log('All exchange files have been updated!'); 