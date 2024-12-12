import { db } from "./Init.js";
import { APP_DATA_DB as app_data_table, BASE_BACKMARKET_URL as base_url, USD_TO_KES_RATE } from '../BaseConstants.js';


/**
 * Brand data will be an array of the given fetched records in
 * the format shown below: 
 * [
 *      {
 *           title: 'iPhone 6s Plus - Locked AT&T',
 *           usd_price: '$98.93',
 *           kes_price: 12860.900000000001,
 *           device_link: '/en-us/p/iphone-6s-plus-64-gb-rose-gold-att/f9ac16b1-9c9b-44d3-8fa3-c6f265a9d04c#l=12'
 *       }
 * ]
 */


export async function storeFetchedData(brandData)
{
    console.log("Inserting brand data to the db: ");
    for(let data of brandData) {
        console.log(`Inserting: ${JSON.stringify(data)}`);

        const usd_price = parseFloat(data.usd_price.replace(/[^0-9.-]+/g, ''));
        await db(app_data_table)
            .insert({
                brand: data.brand,
                name: data.title,
                source: 'BACKMARKET',
                usd_price: isNaN(usd_price) ? 0 : usd_price,
                tagged_name: data.device_link.split('/')[3],
                full_url: `${base_url}${data.device_link}`,
                usd_kes_rate: USD_TO_KES_RATE,
                rated: data.rated,
                current_rating: data.current_rating,
                max_rating: data.max_rating,
                total_reviews: data.total_reviews
            })
    }
}