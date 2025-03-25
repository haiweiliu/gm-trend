const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const csv = require('csv-parse/sync');

// Read the template
async function readTemplate() {
    const template = await fsPromises.readFile(path.join(__dirname, 'GM Trend', 'okxdemo.html'), 'utf8');
    return template;
}

// Read the traffic data
async function readTrafficData() {
    const trafficData = await fsPromises.readFile(path.join(__dirname, 'GM Trend', 'cex_traffic_mar25.json'), 'utf8');
    return JSON.parse(trafficData);
}

// Read the search data
async function readSearchData() {
    const searchData = await fsPromises.readFile(path.join(__dirname, 'GM Trend', 'cex_search_mar25.csv'), 'utf8');
    return csv.parse(searchData, {
        columns: true,
        skip_empty_lines: true
    });
}

// Generate exchange page
function generateExchangePage(template, exchange, trafficData, searchData) {
    const exchangeId = exchange.Keyword.toLowerCase().replace(/\s+/g, '-');
    
    // Special cases mapping
    const specialCases = {
        'gate-io': 'gate.io',
        'crypto-com': 'crypto.com',
        'pump-fun': 'pump.fun',
        'jupiter': 'jup.ag'
    };

    // Find traffic data using either the standard ID or special case
    const searchName = specialCases[exchangeId] || exchangeId;
    const traffic = trafficData.find(t => 
        t.name.toLowerCase().includes(searchName) || 
        t.name.toLowerCase().replace(/\./g, '').includes(searchName.replace(/\./g, ''))
    );
    
    if (!traffic) {
        console.log(`No traffic data found for ${exchange.Keyword}`);
        return null;
    }

    // Format numbers
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    // Get trend status
    const getTrendStatus = (trend) => {
        if (trend.includes('143%') || trend.includes('158%')) return 'EXPLODING';
        if (trend.includes('33%') || trend.includes('42%')) return 'GROWING';
        if (trend.includes('-37%') || trend.includes('-36%')) return 'DECLINING';
        return 'STABLE';
    };

    // Generate the page content
    let pageContent = template
        .replace(/OKX/g, exchange.Keyword)
        .replace(/okx/g, exchangeId)
        .replace(/var\(--okx-primary\)/g, 'var(--primary-color)')
        .replace(/var\(--okx-secondary\)/g, 'var(--secondary-color)')
        .replace(/var\(--okx-light\)/g, 'var(--light-color)')
        .replace(/var\(--okx-dark\)/g, 'var(--dark-color)')
        .replace(/var\(--okx-gradient\)/g, 'var(--gradient)')
        .replace(/Monthly Visits: 32.4M/g, `Monthly Visits: ${formatNumber(traffic.totalVisits)}`)
        .replace(/Search Volume: 823K/g, `Search Volume: ${formatNumber(parseInt(exchange['Search Volume (Global)'].replace(/,/g, '')))}`)
        .replace(/Global Rank: #845/g, `Global Rank: #${traffic.globalRank}`)
        .replace(/Bounce Rate: 38.45%/g, `Bounce Rate: ${(traffic.bounceRate * 100).toFixed(2)}%`)
        .replace(/Avg. Visit Duration: 00:05:30/g, `Avg. Visit Duration: ${traffic.avgVisitDuration}`)
        .replace(/Pages per Visit: 4.2/g, `Pages per Visit: ${traffic.pagesPerVisit}`)
        .replace(/Trend Status: Exploding/g, `Trend Status: ${getTrendStatus(exchange['Trending %'])}`);

    // Update chart data
    const chartData = {
        visits: [
            parseInt(exchange['Mar 2024'].replace(/,/g, '')),
            parseInt(exchange['Apr 2024'].replace(/,/g, '')),
            parseInt(exchange['May 2024'].replace(/,/g, ''))
        ],
        search: [
            parseInt(exchange['Mar 2024'].replace(/,/g, '')),
            parseInt(exchange['Apr 2024'].replace(/,/g, '')),
            parseInt(exchange['May 2024'].replace(/,/g, ''))
        ]
    };

    pageContent = pageContent.replace(
        /data: \[145000000, 152000000, 158200000\]/g,
        `data: ${JSON.stringify(chartData.visits)}`
    ).replace(
        /data: \[823000, 2240000, 1000000\]/g,
        `data: ${JSON.stringify(chartData.search)}`
    );

    // Update top countries
    const topCountries = traffic.topCountries.slice(0, 3).map(country => ({
        name: country.countryAlpha2Code,
        percentage: (country.visitsShare * 100).toFixed(2) + '%'
    }));

    // Create the cex directory if it doesn't exist
    const cexDir = path.join(__dirname, 'cex');
    if (!fs.existsSync(cexDir)) {
        fs.mkdirSync(cexDir);
    }

    // Write the file
    fs.writeFileSync(path.join(cexDir, `${exchangeId}.html`), pageContent);
    console.log(`Generated page for ${exchange.Keyword}`);
}

// Main function
async function main() {
    try {
        const template = await readTemplate();
        const trafficData = await readTrafficData();
        const searchData = await readSearchData();

        // Generate pages for all exchanges
        for (const exchange of searchData) {
            await generateExchangePage(template, exchange, trafficData, searchData);
        }

        console.log('All exchange pages generated successfully!');
    } catch (error) {
        console.error('Error generating pages:', error);
    }
}

main(); 