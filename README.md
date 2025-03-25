# GM Trend - Web3 Trend Intelligence Platform

A modern web application for tracking and analyzing Web3 trends using the Keywords Everywhere API.

## Features
- Real-time trend search and analysis
- Monthly volume data visualization
- Growth rate calculations
- Multi-language support (English/Chinese)
- Responsive design with dark mode support
- Data caching and rate limit handling

## Live Demo
Visit [https://haiweiliu.github.io/gm-trend](https://haiweiliu.github.io/gm-trend)

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Keywords Everywhere API key

### Local Development
1. Clone the repository
```bash
git clone https://github.com/haiweiliu/gm-trend.git
cd gm-trend
```

2. Install dependencies
```bash
npm install
```

3. Configure API Key
Create a `.env` file in the root directory:
```
KEYWORDS_EVERYWHERE_API_KEY=your_api_key_here
```

4. Run locally
```bash
npm start
```
The application will be available at `http://localhost:3000`

### Deployment

#### GitHub Pages
1. Update the `homepage` in `package.json`:
```json
{
  "homepage": "https://haiweiliu.github.io/gm-trend"
}
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

## Environment Variables
- `KEYWORDS_EVERYWHERE_API_KEY`: Your API key from Keywords Everywhere (required)
- `PORT`: Server port (default: 3000)

## Languages
- English (default)
- Chinese (access with `?lang=cn` parameter)

## Tech Stack
- HTML5
- TailwindCSS
- Chart.js
- Express.js
- Keywords Everywhere API

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 