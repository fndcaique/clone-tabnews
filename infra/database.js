import { Client } from 'pg';
import { DATABASE } from './config';
import { ServiceError } from './errors';

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
    try {
      await clientInstance.connect();
    } catch (error) {
      const serviceError = new ServiceError({
        cause: error,
        message: 'Error connecting to database',
      });
      throw serviceError;
    }
  }
  return clientInstance;
};

const query = async (...params) => {
  let client;
  client = await getClient();
  try {
    return await client.query(...params);
  } catch (error) {
    const serviceError = new ServiceError({
      cause: error,
      message: 'Error executing query',
    });
    throw serviceError;
  } finally {
    if (client) {
      await client.end();
    }
  }
};

export default { query, getClient };
