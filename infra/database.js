import { Client } from 'pg';

async function query(...params) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number.parseInt(process.env.POSTGRES_PORT, 10),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });
  try {
    await client.connect();
    const result = await client.query(...params);
    return result;
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
  return null;
}

export default {
  query: query,
};
