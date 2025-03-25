const fs = require('fs');
const path = require('path');

// Read the template
const template = fs.readFileSync('GM Trend/okxdemo.html', 'utf8');

// Get all exchange HTML files
const cexDir = path.join(__dirname, 'cex');
const files = fs.readdirSync(cexDir).filter(file => file.endsWith('.html'));

// Update each file
files.forEach(file => {
  const exchangeName = file.replace('.html', '');
  // Replace OKX with the exchange name in the title
  let content = template.replace('OKX Wallet | Trend Radar', `${exchangeName.toUpperCase()} | Trend Radar`);
  
  // Write the updated content
  fs.writeFileSync(path.join(cexDir, file), content);
  console.log(`Updated ${file}`);
}); 