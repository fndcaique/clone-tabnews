import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV || 'development';

const isProduction = env === 'production';
const envFileName = `.env.${isProduction ? 'production' : 'development'}`;
dotenv.config({ path: resolve(__dirname, '..', envFileName), quiet: true });

const getDatabaseSslValue = () => {
  if (process.env.POSTGRES_CA) {
    return {
      rejectUnauthorized: true,
      ca: process.env.POSTGRES_CA,
    };
  }
  return isProduction;
};

export const DATABASE = {
  host: process.env.POSTGRES_HOST,
  port: Number.parseInt(process.env.POSTGRES_PORT, 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: getDatabaseSslValue(),
  migrations: {
    directory: resolve(__dirname, 'migrations'),
    tableName: 'pgmigrations',
  },
};
