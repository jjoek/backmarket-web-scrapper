const { chromium } = require('playwright');  // Importing Playwright's Chromium library

const maxTimeout = 120000; // 2 minutes

const usd_to_kes = 130

async function getBrowserInstance()
{
  // Launch the browser in headless mode (no UI)
  return await chromium.launch({
    executablePath: "/snap/bin/brave"
  });
}

async function fetchSmartPhonesUrl()
{
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

async function fetchBrandLiks(smartphones_url)
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

async function fetchBrandData(brandLink)
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

  const selector = '#__nuxt > div > div:nth-child(5) > div.flex.justify-center > div > div > section:nth-child(1) > div.lg\\:flex.lg\\:gap-16 > main > div.mb-20.grid.grid-cols-1.gap-16.md\\:grid-cols-2.lg\\:grid-cols-3';
  const link = await page.waitForSelector(selector, {timeout: maxTimeout});

  // Check if the element exists before extracting its text
  if(!link) {
    console.error('Smartphones header element not found');
    throw new Error("Unable to fetch smartphones url");
  }

  const ulElement = await page.$(selector); // Try getting the element after waiting

  if (ulElement) {
    // we've ignored the staff pick selection which is div-ed than the rest which are a tagged
    // Get all <li> elements inside the <ul>
    const phones = await ulElement.$$(':scope > a');  // ':scope' ensures we're targeting direct <li> children
    
    // Loop through each <li> and extract the <a> tag within it
    for (let phone of phones) {
      let title = ''
      let price = ''
      let device_link = await phone.getAttribute('href');
      const titleSelector = 'div > div.flex.p-16.pt-0 > div > div.flex.grow.basis-\\[159px\\].flex-col.items-start.gap-6 > div.flex.flex-col.gap-2 > h2 > span'
      const titleEl = await phone.$(titleSelector);  // Get the <a> tag inside the current <li>
      
      if(titleEl) {
        title = await titleEl.innerText()
      }

      const priceSelector = 'div > div.flex.p-16.pt-0 > div > div.flex.grow.basis-\\[159px\\].flex-col.items-start.gap-6 > div:nth-child(3) > div.flex.flex-col > div.text-static-default-hi.body-2-bold'
      const priceEl = await phone.$(priceSelector);

      if(priceEl) {
        price = await priceEl.innerText();
      }
      
      const usd_price = parseFloat(price.replace(/[^0-9.-]+/g, ''));
      const kes_price = usd_price * usd_to_kes;
     console.log(`\t${title} ------------------------------ USD Price: ${price} ---- KES: ${kes_price.toLocaleString()} --------- Link: ${device_link}`);
    }
  }

  await browser.close();
}


(async () => {
  console.log("Scrapper initiated...");
  const smartphones_url = await fetchSmartPhonesUrl();
  console.log("Smartphones url: " + smartphones_url);


  console.log("Fetching brand links");
  const brandLinks = await fetchBrandLiks(smartphones_url);

  if(!brandLinks || brandLinks.length < 1) {
    console.error("Empty links found");
    throw new Error("Empty links found");
  }

  for(let brandLink of brandLinks) {
    console.log(`Fetching brand data: ${brandLink}`);
    const brandData = await fetchBrandData(brandLink);
    
    console.log("\n\n\n On to the next one: ")
  }
})();
