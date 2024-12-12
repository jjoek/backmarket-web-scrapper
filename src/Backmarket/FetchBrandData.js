import getBrowserInstance from "../BrowserInstance.js";
import { MAX_TIMEOUT as maxTimeout } from "../BaseConstants.js";
import { BASE_BACKMARKET_URL as base_url } from '../BaseConstants.js';
import { USD_TO_KES_RATE as usd_to_kes } from "../BaseConstants.js";


async function getBrandPageData(pageBrandLink, brand = '') 
{
  console.log(`\n\n On page url: ${pageBrandLink}`)
  const pageData = [];

  const browser = await getBrowserInstance();

  // Create a new browser context (session)
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });

  // Open a new page (browser tab)
  const page = await context.newPage();

  // Navigate to page
  await page.goto(pageBrandLink);

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
      let rated = true;
      let current_rating = 0;
      let max_rating = 5;
      let total_reviews = 0;



      const titleSelector = 'div > div.flex.p-16.pt-0 > div > div.flex.grow.basis-\\[159px\\].flex-col.items-start.gap-6 > div.flex.flex-col.gap-2 > h2 > span'
      const titleEl = await phone.$(titleSelector);  // Get the <a> tag inside the current <li>
      
      if(titleEl) {
        title = await titleEl.innerText()
      }
      
      let priceSelector = 'div > div.flex.p-16.pt-0 > div > div.flex.grow.basis-\\[159px\\].flex-col.items-start.gap-6 > div:nth-child(3) > div.flex.flex-col > div.text-static-default-hi.body-2-bold'
      let priceEl = await phone.$(priceSelector);

      if(!priceEl) {
        // There are those phones listed with rating and others are not rated, like the one below
        priceSelector = 'div > div > div > div.flex.grow.basis-\\[159px\\].flex-col.items-start.gap-6 > div:nth-child(2) > div.flex.flex-col > div.text-static-default-hi.body-2-bold'
        priceEl = await phone.$(priceSelector);
        rated = false;
      }

      if(rated) {
        const ratingSelector = 'div > div.flex.p-16.pt-0 > div > div.flex.grow.basis-\\[159px\\].flex-col.items-start.gap-6 > div.flex.items-center > div > span'
        const ratingEl = await phone.$(ratingSelector);
        const rating = ratingEl ? await ratingEl.innerText() : null;
        current_rating = rating ? rating.split('/')[0] : current_rating;
        max_rating = rating ? rating.split('/')[1] : max_rating
      }

      if(rated) {
        const reviewsSelector = 'div > div.flex.p-16.pt-0 > div > div.flex.grow.basis-\\[159px\\].flex-col.items-start.gap-6 > div.flex.items-center > span';
        const reviewsEl = await phone.$(reviewsSelector);
        total_reviews = reviewsEl ? await reviewsEl.innerText() : total_reviews;
        total_reviews = total_reviews ? parseFloat(total_reviews.replace(/[()]/g, "")) : 0;
      }


      if(priceEl) {
        price = await priceEl.innerText();
      }

      if(!priceEl) {
        throw new Error('');
      }
      
      const usd_price = parseFloat(price.replace(/[^0-9.-]+/g, ''));
      const kes_price = usd_price * usd_to_kes;

      const elData = {
        title,
        usd_price: price,
        kes_price,
        device_link,
        brand,
        rated,
        current_rating,
        max_rating,
        total_reviews
      }

      pageData.push(elData);

     console.log(`\t${title} ---------------- USD Price: ${price} ---- KES: ${kes_price.toLocaleString()} --------- Link: ${device_link}`);
    }
  }

  await browser.close();

  return pageData;
}

// black market pages start from 0 so the paged links there will be page - 1;
export default async function fetchBrandData(brandLink, brandTotalPages = 0, brand = '')
{
    let brandData = [];
    
    for(let currentPage = 0; currentPage < brandTotalPages; currentPage++) {

        let pageBrandLink = `${base_url}${brandLink}`;

        if(currentPage > 1) {
            pageBrandLink = `${pageBrandLink}?p=${currentPage}`
        }

        const pageData = await getBrandPageData(pageBrandLink, brand);

        brandData = brandData.concat(pageData)
    }

    console.log(brandData);

    return brandData;
}
