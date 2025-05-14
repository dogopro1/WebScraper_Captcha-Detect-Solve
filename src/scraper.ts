import fs from 'fs';
import readline from 'readline';
import { ScraperEngine } from './scraperEngine';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const JPG_REGEX = /https?:\/\/[^"' >]+\.jpg\b/g;
const PDF_REGEX = /https?:\/\/[^"' >]+\.pdf\b/g;

type ScanMode = 'email' | 'jpg' | 'pdf' | 'all' | 'html';

async function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, a => {
        rl.close();
        resolve(a.trim());
    }));
}

function extractData(html: string, mode: ScanMode): string[] {
    let results: string[] = [];

    if (mode === 'email' || mode === 'all') {
        results.push(...(html.match(EMAIL_REGEX) || []));
    }
    if (mode === 'jpg' || mode === 'all') {
        results.push(...(html.match(JPG_REGEX) || []));
    }
    if (mode === 'pdf' || mode === 'all') {
        results.push(...(html.match(PDF_REGEX) || []));
    }

    return [...new Set(results)];
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapePage(
    scraperEngine: ScraperEngine,
    url: string,
    depth: number,
    maxDepth: number,
    visited: Set<string>,
    mode: ScanMode,
    fetchHTML: boolean,
    failedUrls: { url: string, reason: string }[]
): Promise<void> {
    if (depth > maxDepth || visited.has(url)) return;
    visited.add(url);

    console.log(`🔍 [${depth}] ${url}`);
    const content = await scraperEngine.navigateAndGetContent(url);
    if (!content) return;

    const extracted = extractData(content, mode);

    const pageName = new URL(url).hostname.replace('www.', '');
    const fileName = `scraped_data_${pageName}.txt`;

    if (extracted.length > 0) {
        fs.appendFileSync(
            fileName,
            `\nURL: ${url}\n---\n${extracted.join('\n')}\n---\n`
        );
    }

    if (fetchHTML) {
        fs.appendFileSync(fileName, `\n\n--- FULL HTML: ${url} ---\n${content}\n---\n`);
    }

    if (depth < maxDepth && !fetchHTML) {
        const links = await scraperEngine.getPageLinks();
        const limitedLinks = shuffleArray(links).slice(0, 10);

        for (const link of limitedLinks) {
            await delay(2000 + Math.random() * 1000);
            await scrapePage(scraperEngine, link, depth + 1, maxDepth, visited, mode, fetchHTML, failedUrls);
        }
    }
}

function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

async function startScraping() {
    const startUrl = await askQuestion('🔗 Enter URL to scrape: ');
    const modeInput = await askQuestion('🧠 What to scrape? (email, jpg, pdf, all, html): ');
    const depthInput = await askQuestion('🔁 Depth (0 = just this page, 1 = follow links once, 2 = twice): ');

    const fetchHTML = modeInput === 'html' || modeInput === 'all';
    const mode = modeInput as ScanMode;

    if (!['email', 'jpg', 'pdf', 'all', 'html'].includes(mode)) {
        console.error('❌ Unknown mode.');
        return;
    }

    const maxDepth = Math.max(0, Math.min(2, parseInt(depthInput) || 0));

    const scraperEngine = new ScraperEngine();
    await scraperEngine.init();

    const pageName = new URL(startUrl).hostname.replace('www.', '');
    const fileName = `scraped_data_${pageName}.txt`;
    fs.writeFileSync(fileName, '');

    const visited = new Set<string>();
    const failedUrls: { url: string, reason: string }[] = [];

    await scrapePage(scraperEngine, startUrl, 0, maxDepth, visited, mode, fetchHTML, failedUrls);

    await scraperEngine.close();

    if (failedUrls.length > 0) {
        fs.appendFileSync(fileName, `\n\n--- ❌ Failed URLs ---\n`);
        for (const fail of failedUrls) {
            fs.appendFileSync(fileName, `URL: ${fail.url}\nError: ${fail.reason}\n---\n`);
        }
    }

    console.log(`✅ Done. Results saved in ${fileName}`);
}

startScraping();
