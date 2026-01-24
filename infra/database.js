import { Client } from 'pg';
import { DATABASE } from './config';

let connectionConfig = null;
let clientInstance = null;

async function isConnected() {
  try {
    await clientInstance.query('SELECT 1+1 AS result');
    return true;
  } catch {
    return false;
  }
}

const getClient = async () => {
  if (!(await isConnected())) {
    connectionConfig = {
      user: DATABASE.user,
      password: DATABASE.password,
      host: DATABASE.host,
      port: DATABASE.port,
      database: DATABASE.database,
      ssl: DATABASE.ssl,
    };
    clientInstance = new Client(connectionConfig);
    await clientInstance.connect();
  }
  return clientInstance;
};

const query = async (...params) => {
  let client;
  try {
    try {
      client = await getClient();
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
    return await client.query(...params);
  } catch (error) {
    console.error(error);
  } finally {
    if (client) {
      await client.end();
    }
  }
};

export default { query, getClient };
