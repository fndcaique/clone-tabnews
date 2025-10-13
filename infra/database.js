import Knex from 'knex';
import KnexConfig from './knexconfig';

const knexEnvConfig =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';
let connectionConfig = null;
let connectionInstance = null;

async function isConnected() {
  try {
    await connectionInstance.raw('SELECT 1+1 AS result');
    return true;
  } catch {
    return false;
  }
}

const connection = async () => {
  if (!(await isConnected())) {
    connectionConfig = KnexConfig[knexEnvConfig];
    connectionInstance = Knex(connectionConfig);
  }
  return connectionInstance;
};

const query = async (...params) => {
  let db;
  try {
    try {
      db = await connection();
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
    return await db.raw(...params);
  } catch (error) {
    console.error(error);
  } finally {
    if (db) {
      await db.destroy();
    }
  }
};

export default { query, connection };
