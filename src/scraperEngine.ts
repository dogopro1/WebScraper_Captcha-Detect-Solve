import { chromium, Browser, Page } from 'playwright';

export class ScraperEngine {
    private browser: Browser | null = null;
    public page: Page | null = null;

    async init() {
        this.browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        const context = await this.browser.newContext({
            userAgent: this.getRandomUserAgent(),
            viewport: { width: 1920, height: 1080 },
            ignoreHTTPSErrors: true,
            javaScriptEnabled: true,
            extraHTTPHeaders: this.getHeaders()
        });

        // Add stealth scripts
        await context.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            // @ts-ignore
            window.chrome = { runtime: {} };
        });

        this.page = await context.newPage();
        await this.setupPage();
    }

    private async setupPage() {
        if (!this.page) return;

        // Set default timeout
        this.page.setDefaultTimeout(30000);

        // Handle dialogs
        this.page.on('dialog', async dialog => await dialog.dismiss());

        // Block unnecessary resources
        await this.page.route('**/*', (route) => {
            const request = route.request();
            if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                route.abort();
            } else {
                route.continue();
            }
        });
    }

    private getHeaders() {
        return {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
        };
    }

    private getRandomUserAgent(): string {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15'
        ];
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }

    async close() {
        await this.browser?.close();
    }

    async navigateAndGetContent(url: string): Promise<string | null> {
        if (!this.page) throw new Error("Page not initialized");

        try {
            await this.page.waitForTimeout(1000 + Math.random() * 2000);

            const response = await this.page.goto(url, {
                timeout: 30000,
                waitUntil: 'domcontentloaded'
            });

            if (!response) {
                console.warn(`❌ No response from ${url}`);
                return null;
            }

            // Wait for any dynamic content
            await this.page.waitForTimeout(2000);

            // Try to bypass any protection
            await this.bypassProtection();

            const content = await this.page.content();
            if (!content || content.length < 100) {
                console.warn(`❌ Empty or too short content from ${url}`);
                return null;
            }

            return content;

        } catch (err) {
            console.warn(`❌ Error loading ${url}:`, err);
            return null;
        }
    }

    private async bypassProtection() {
        if (!this.page) return;

        try {
            // Try to click common protection buttons
            const buttons = [
                'button:visible:has-text("Continue")',
                'button:visible:has-text("I am human")',
                'button:visible:has-text("Verify")',
                '#challenge-stage button'
            ];

            for (const selector of buttons) {
                const button = await this.page.$(selector);
                if (button) {
                    await button.click();
                    await this.page.waitForTimeout(2000);
                }
            }

            // Handle potential iframes
            const frames = this.page.frames();
            for (const frame of frames) {
                try {
                    await frame.click('.recaptcha-checkbox-border');
                } catch (e) {}
            }

        } catch (e) {}
    }

    async getPageLinks(): Promise<string[]> {
        if (!this.page) return [];

        try {
            return await this.page.$$eval('a[href]', (links) =>
                links.map((link) => link.href)
                    .filter((href) => href.startsWith('http'))
            );
        } catch (e) {
            return [];
        }
    }
}
