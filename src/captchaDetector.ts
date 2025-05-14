import { Page } from 'playwright';

export class CaptchaDetector {
    static async isCaptchaPresent(page: Page): Promise<boolean> {
        try {
            const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());

            const commonCaptchaText = [
                'captcha',
                'are you human',
                'verify you are',
                'press and hold',
                'i am not a robot',
                'human verification',
                'security check',
                'please verify',
                'recaptcha'
            ];

            const captchaSelectors = [
                'iframe[src*="recaptcha"]',
                'iframe[src*="hcaptcha"]',
                'div[class*="captcha"]',
                'div[id*="captcha"]',
                'input[name*="captcha"]',
                '#recaptcha',
                '.g-recaptcha',
                '.h-captcha'
            ];

            const hasTextCaptcha = commonCaptchaText.some(txt => bodyText.includes(txt));

            const hasElementCaptcha = await page.evaluate((selectors) => {
                return selectors.some(selector => document.querySelector(selector) !== null);
            }, captchaSelectors);

            return hasTextCaptcha || hasElementCaptcha;

        } catch (e) {
            console.warn('⚠️ Error checking CAPTCHA:', e);
            return false;
        }
    }
}
