import knex from 'knex';
import { APP_DATA_DB as app_data_table } from '../BaseConstants.js';

const app_db = null;

function dbInst()
{
    if(app_db) {
        return app_db;
    }

    return knex({
        client: 'mysql2',
        connection: {
          host: '127.0.0.1',
          port: 3306,
          user: 'john',
          password: 'secret',
          database: 'scrapper',
        },
    });
}

export const db = dbInst();


export default async function initDb() {
    console.log("Database setup started....");

    console.log('\tchecking table');
    const hasTable = await db.schema.hasTable(app_data_table);

    console.log('\ttable checked');
    if(hasTable) {
        console.log(`\thas table ${app_data_table}`);
    }

    if(!hasTable) {
        console.log("\tCreating app data table...");

        await db.schema.createTable(app_data_table, function (table) {
            table.increments();
            table.string('brand');
            table.string('name');
            table.string('source');
            table.decimal('usd_price');
            table.string('tagged_name');
            table.string('full_url');
            table.decimal('usd_kes_rate').nullable();
            table.decimal('kes_avg_prce').nullable();
            table.timestamps();
        });
    }

    console.log('\tDB setup done')

    return;
}