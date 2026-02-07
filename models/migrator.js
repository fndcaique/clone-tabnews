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
  } finally {
    await dbClient.end();
  }
};

export const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};
