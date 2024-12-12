
import fetchSmartPhonesUrl from './src/Backmarket/FetchSmartphonesUrl.js';
import fetchBrandLiks from './src/Backmarket/FetchBrandLinks.js';
import fetchBrandData from './src/Backmarket/FetchBrandData.js';
import fetchBrandTotalPages from './src/Backmarket/FetchBrandTotalPages.js';
import { storeFetchedData } from './src/Database/StoreFetchedData.js';
import initDb from './src/Database/Init.js';

(async () => {
  await initDb();

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
    const brand = brandLink.split('/')[3]
    console.log(`Fetching brand total pages: ${brand}`)
    const brandTotalPages = await fetchBrandTotalPages(brandLink);

    console.log(`Fetching brand data: ${brandLink}`);
    const brandData = await fetchBrandData(brandLink, brandTotalPages, brand);
    
    console.log("\n\n\n On to the next one: ")
    await storeFetchedData(brandData);
  }

  process.exit(0);
})();
