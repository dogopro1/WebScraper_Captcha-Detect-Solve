
# Web Scraper with CAPTCHA Detection & Solving

[![Node.js Version](https://img.shields.io/badge/node-%3E=18.0.0-green)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A lightweight web scraping tool built with TypeScript and Playwright.  
It supports recursive scraping, email/image/PDF extraction, and basic CAPTCHA detection/solving.

## ✨ Features

### 🛡️ Supported CAPTCHA Types
- reCAPTCHA (Google)
- hCaptcha
- Cloudflare challenge (basic checkbox)

### 🧠 User-Agent Rotation
The scraper randomly selects from real browser user-agent strings (Chrome, Firefox, Safari) to mimic human behavior and avoid basic bot detection.

- ✅ Extracts emails, JPG image links, and PDF URLs
- 🔁 Recursive scraping with configurable depth (0–2)
- 🧠 Multiple user-agents for bot evasion
- 🛡️ CAPTCHA detection and solving (reCAPTCHA, hCaptcha, Cloudflare)
- 📝 Saves results to `.txt` files (per domain)

## 📦 Installation

> Requires **Node.js v18+**

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/WebScraper_Captcha-Detect-Solve.git
   ```
2. Navigate to the project directory:
   ```bash
   cd WebScraper_Captcha-Detect-Solve
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## 🚀 Usage

To start the scraper, run the following command:

```bash
  npm start
```

You will be prompted to enter:

- 🌐 The URL to scrape
- 🔍 What to extract (`email`, `jpg`, `pdf`, `all`, or `html`)
- 🔁 Depth of scraping (0 = only this page, up to 2)

Scraped data is saved in a text file named after the domain (e.g. `scraped_data_example.com.txt`).

## 📁 Project Structure

```
scraper/scraper.ts           // Entry point – CLI and core logic
scraper/scraperEngine.ts     // Playwright-based browser engine
scraper/captchaDetector.ts   // Detects CAPTCHA presence
scraper/captchaSolver.ts     // Attempts basic CAPTCHA solving
```

## 🧱 Built With

- [Playwright](https://playwright.dev/)
- TypeScript
- ts-node
- Node.js modules: fs, readline

## ⚠️ Legal Notice

This project is for **educational purposes only**.  
Ensure you comply with the target website’s Terms of Service when scraping.

## 📄 License

MIT – use freely, give credit if you find it useful.
