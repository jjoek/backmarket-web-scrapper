
import getBrowserInstance from "../BrowserInstance";

export default async function fetchSmartPhonesUrl(params) {
  const browser = await getBrowserInstance();

  // Create a new browser context (session)
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });

  // Open a new page (browser tab)
  const page = await context.newPage();

  // Navigate to page
  await page.goto(`${base_url}/en-us`);

  const link = await page.waitForSelector('#header > div:nth-child(2) > nav > ul > li:nth-child(2) > div > a', {timeout: maxTimeout})

  // Check if the element exists before extracting its text
  if(!link) {
    console.error('Smartphones header element not found');
    throw new Error("Unable to fetch smartphones url");
  }

  const smartphones_url = await link.getAttribute('href');  // Extract the text content from the <a> element

  await browser.close();

  return smartphones_url;
}

