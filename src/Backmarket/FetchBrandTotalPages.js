import getBrowserInstance from "../BrowserInstance.js";
import { BASE_BACKMARKET_URL as base_url } from '../BaseConstants.js';
import { MAX_TIMEOUT as maxTimeout } from "../BaseConstants.js";

export default async function fetchBrandTotalPages(brandLink)
{
    const browser = await getBrowserInstance();

    // Create a new browser context (session)
    const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    // Open a new page (browser tab)
    const page = await context.newPage();

    // Navigate to page
    await page.goto(`${base_url}${brandLink}`);

    const selector = '#pagination-pages';
    const pagesLink = await page.waitForSelector(selector, {timeout: maxTimeout});

    // Check if the element exists before extracting its text
    if(!pagesLink) {
        console.error('Error fetching brand total pages');
        throw new Error("Error fetching brand total pages");
    }

    const lastLiSelector = `li:last-child > button`;
    const lastLiButton = await pagesLink.$(lastLiSelector)
    const buttonText = await lastLiButton.innerText();

    console.log(buttonText);
    return buttonText;
}