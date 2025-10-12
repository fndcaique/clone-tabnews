import { Client } from 'pg';

const getSslValue = () => {
  if (process.env.POSTGRES_CA) {
    return {
      rejectUnauthorized: true,
      ca: process.env.POSTGRES_CA,
    };
  }
  return !(process.env.NODE_ENV === 'development');
};

async function query(...params) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number.parseInt(process.env.POSTGRES_PORT, 10),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSslValue(),
  });
  try {
    try {
      await client.connect();
    } catch (error) {
      console.log('Error connecting to database');
      throw error;
    }
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
