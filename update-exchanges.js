const fs = require('fs');
const path = require('path');

// Read the data files
const keywordData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/keyworld_cex_mar25.json'), 'utf8'));
const similarwebData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/similarweb_cex_mar25.json'), 'utf8'));
const template = fs.readFileSync(path.join(__dirname, 'exchange-template.html'), 'utf8');

// Helper function to format numbers
function formatNumber(num) {
    if (typeof num === 'string') {
        num = parseInt(num.replace(/,/g, ''));
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Helper function to format duration
function formatDuration(duration) {
    if (!duration) return '0:00';
    return duration.replace('00:', '');
}

// Helper function to determine trend status
function getTrendStatus(trendingPercent) {
    const percent = parseFloat(trendingPercent);
    if (percent > 10) {
        return { status: 'Growing', cssClass: 'trend-up' };
    } else if (percent < -10) {
        return { status: 'Declining', cssClass: 'trend-down' };
    }
    return { status: 'Stable', cssClass: 'trend-stable' };
}

// Process each exchange
keywordData.forEach(exchange => {
    const exchangeName = exchange.Keyword.replace(' ', '-');
    const similarweb = similarwebData.find(s => s.name.includes(exchangeName) || exchangeName.includes(s.name.split('.')[0]));
    
    if (!similarweb) {
        console.log(`No Similarweb data found for ${exchangeName}`);
        return;
    }

    // Prepare the data for the template
    const data = {
        name: exchangeName.toUpperCase(),
        logo: similarweb.icon || '',
        colors: {
            primary: '#3B82F6',
            secondary: '#60A5FA'
        },
        metrics: {
            monthlyVisits: formatNumber(similarweb.totalVisits || 0),
            searchVolume: formatNumber(exchange['Search Volume (Global)'].replace(/,/g, '')),
            globalRank: similarweb.globalRank || 'N/A',
            bounceRate: ((similarweb.bounceRate || 0) * 100).toFixed(1) + '%',
            avgVisitDuration: formatDuration(similarweb.avgVisitDuration),
            pagesPerVisit: similarweb.pagesPerVisit || 'N/A'
        },
        trendStatus: getTrendStatus(exchange['Trending %']),
        topCountries: similarweb.topCountries ? 
            Object.fromEntries(
                similarweb.topCountries
                    .slice(0, 5)
                    .map(c => [c.countryAlpha2Code, (c.visitsShare * 100).toFixed(1) + '%'])
            ) : {},
        chartData: {
            visits: [
                similarweb.totalVisits || 0,
                similarweb.totalVisits * 0.9 || 0,
                similarweb.totalVisits * 1.1 || 0
            ],
            search: [
                parseInt(exchange['Dec 2024'].replace(/,/g, '')),
                parseInt(exchange['Jan 2025'].replace(/,/g, '')),
                parseInt(exchange['Feb 2025'].replace(/,/g, ''))
            ]
        },
        features: [
            'Spot Trading',
            'Futures Trading',
            'Margin Trading',
            'Staking',
            'NFT Marketplace',
            'Mobile App',
            'API Access',
            'Fiat Gateway'
        ]
    };

    // Replace template variables
    let html = template;
    html = html.replace(/{{name}}/g, data.name);
    html = html.replace(/{{logo}}/g, data.logo);
    html = html.replace(/{{colors.primary}}/g, data.colors.primary);
    html = html.replace(/{{colors.secondary}}/g, data.colors.secondary);
    html = html.replace(/{{metrics.monthlyVisits}}/g, data.metrics.monthlyVisits);
    html = html.replace(/{{metrics.searchVolume}}/g, data.metrics.searchVolume);
    html = html.replace(/{{metrics.globalRank}}/g, data.metrics.globalRank);
    html = html.replace(/{{metrics.bounceRate}}/g, data.metrics.bounceRate);
    html = html.replace(/{{metrics.avgVisitDuration}}/g, data.metrics.avgVisitDuration);
    html = html.replace(/{{metrics.pagesPerVisit}}/g, data.metrics.pagesPerVisit);
    html = html.replace(/{{trendStatus.cssClass}}/g, data.trendStatus.cssClass);
    html = html.replace(/{{trendStatus.status}}/g, data.trendStatus.status);

    // Replace chart data
    html = html.replace(/{{chartData.visits}}/g, JSON.stringify(data.chartData.visits));
    html = html.replace(/{{chartData.search}}/g, JSON.stringify(data.chartData.search));

    // Replace top countries
    let countriesHtml = '';
    Object.entries(data.topCountries).forEach(([country, share]) => {
        countriesHtml += `
        <div class="flex justify-between items-center">
            <span class="text-gray-600">${country}</span>
            <span class="font-semibold">${share}</span>
        </div>`;
    });
    html = html.replace(/{{#each topCountries}}[\s\S]*?{{\/each}}/g, countriesHtml);

    // Replace features
    let featuresHtml = data.features.map(feature => `
        <div class="bg-gray-50 rounded-lg p-3 text-center">
            <span class="text-sm font-medium">${feature}</span>
        </div>`).join('');
    html = html.replace(/{{#each features}}[\s\S]*?{{\/each}}/g, featuresHtml);

    // Write the file
    const outputPath = path.join(__dirname, 'cex', `${exchangeName}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`Updated ${exchangeName}.html`);
});

console.log('All exchange files have been updated!'); 