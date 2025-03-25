// Encrypted configuration for API keys
window.ENCRYPTED_CONFIG = {
    // Instructions:
    // 1. Replace KEYWORDS_EVERYWHERE_API_KEY with your actual Keywords Everywhere API key
    // 2. Replace APIFY_API_KEY with your actual Apify API key
    
    // Example of how to encrypt your API key:
    // 1. Take your API key
    // 2. Use the daily salt format: gm-trend-YYYY-MM-DD-salt
    // 3. Use an encryption tool to encrypt with AES
    // 4. Replace the encrypted string below
    
    keywordsEverywhere: {
        key: "ENCRYPTED_KEY_HERE", // Replace with your encrypted Keywords Everywhere API key
        salt: "gm-trend-salt"
    },
    
    apify: {
        key: "ENCRYPTED_KEY_HERE", // Replace with your encrypted Apify API key
        salt: "gm-trend-salt"
    }
}; 