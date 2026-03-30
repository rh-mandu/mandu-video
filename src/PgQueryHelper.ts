import {Client} from "pg";
import dotenv from "dotenv";

dotenv.config();

export async function doQuery(queryFunction : (client: Client) => Promise<any>) : Promise<any>
{

    const ssl = process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false };
    const client = await new Client({ ssl });
    await client.connect();
    console.log(process.env.CURRENT_SCHEMA);
    if (process.env.CURRENT_SCHEMA) {
        const schema = process.env.CURRENT_SCHEMA;
        await client.query(`SET search_path TO "${schema}"`);
    }
    let result = await queryFunction(client);
    client.end();
    return result;
}