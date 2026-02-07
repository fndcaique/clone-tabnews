import AsyncRetry from 'async-retry';
import database from '@/infra/database';
import { migrator } from '@/models/migrator';

const fetchStatusPage = async () => {
  const response = await fetch('http://localhost:3000/api/v1/status');
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
};
const waitForWebServer = async () => {
  return await AsyncRetry(fetchStatusPage, {
    retries: 30,
    maxTimeout: 1000,
    onRetry: (error, attempt) => {
      console.log(`Attempt ${attempt} failed. Reason: ${error.message}`);
    },
  });
};
const waitForAllServices = async () => {
  await waitForWebServer();
};

const clearDatabase = async () => {
  await database.query('DROP schema public CASCADE; CREATE schema public;');
};

const runPendingMigrations = async () => {
  await migrator.runPendingMigrations();
};

export const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
};
