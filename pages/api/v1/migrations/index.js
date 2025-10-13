import { resolve } from 'node:path';
import * as NodePgMigrate from 'node-pg-migrate';
import database from '@/infra/database';

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve('infra', 'migrations'),
  direction: 'up',
  log: () => {},
  migrationsTable: 'pgmigrations',
};
const listPendingMigrations = async () => {
  let dbClient;
  try {
    dbClient = await database.getClient();
    const migrationsPending = await NodePgMigrate.runner({
      ...defaultMigrationOptions,
      dbClient,
    });
    return { pending: migrationsPending.map(({ name }) => name) };
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
};

const runPendingMigrations = async () => {
  let dbClient;
  try {
    dbClient = await database.getClient();
    const migrationsPending = await NodePgMigrate.runner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });
    return { executed: migrationsPending.map(({ name }) => name) };
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
};

export default async function migrations(request, response) {
  if (request.method === 'GET') {
    const result = await listPendingMigrations();

    response.status(200).json(result);
    return;
  }

  if (request.method === 'POST') {
    const result = await runPendingMigrations();

    response.status(result.executed.length ? 201 : 200).json(result);
    return;
  }

  return response
    .status(405)
    .json({ message: `Method ${request.method} not allowed` });
}
