import getBrowserInstance from "../BrowserInstance.js";
import { BASE_BACKMARKET_URL as base_url } from '../BaseConstants.js';
import { MAX_TIMEOUT as maxTimeout } from "../BaseConstants.js";


export default async function fetchBrandLiks(smartphones_url)
{
  let brandLinks = [];
  
  const browser = await getBrowserInstance();

  // Create a new browser context (session)
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  
  // Open a new page (browser tab)
  const page = await context.newPage();

  // Navigate to page
  await page.goto(`${base_url}${smartphones_url}`);

  const selector = '#__nuxt > div > div:nth-child(5) > div:nth-child(4) > div > div > div > div > div > nav > ul';
  const brandsSection = await page.waitForSelector(selector, {timeout: maxTimeout});

  if(!brandsSection) {
    console.error('Brands section element not found');
    throw new Error("Brands section element not found");
  }

  const ulElement = await page.$(selector); // Try getting the element after waiting

  if (ulElement) {
    // Get all <li> elements inside the <ul>
    const liElements = await ulElement.$$(':scope > li');  // ':scope' ensures we're targeting direct <li> children
    
    // Loop through each <li> and extract the <a> tag within it
    for (let li of liElements) {
      const link = await li.$('div > div > div > div:nth-child(1) > a');  // Get the <a> tag inside the current <li>
      
      if (link) {
        // Extract the href attribute of the <a> tag
        const href = await link.getAttribute('href');
        brandLinks.push(href);
        console.log("\tLink:", href);  // Print the href of each <a> tag
      }
    }
  }

  await browser.close();

  return brandLinks;
}