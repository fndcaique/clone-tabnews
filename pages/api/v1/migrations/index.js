import * as NodePgMigrate from 'node-pg-migrate';
import { DATABASE } from '@/infra/config';
import database from '@/infra/database';

const defaultMigrationOptions = {
  dryRun: true,
  dir: DATABASE.migrations.directory,
  direction: 'up',
  log: () => {},
  migrationsTable: DATABASE.migrations.tableName,
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
