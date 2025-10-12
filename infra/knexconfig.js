import { DATABASE } from './config.js';

const dbConfig = {
  client: 'pg',
  connection: {
    host: DATABASE.host,
    port: DATABASE.port,
    user: DATABASE.user,
    password: DATABASE.password,
    database: DATABASE.database,
    ssl: DATABASE.ssl,
  },
  migrations: DATABASE.migrations,
  debug: false,
};

export default {
  development: dbConfig,
  production: dbConfig,
};
