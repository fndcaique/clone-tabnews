import { createRouter } from 'next-connect';
import * as NodePgMigrate from 'node-pg-migrate';
import { DATABASE } from '@/infra/config';
import { controller } from '@/infra/controller';
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

async function getHandler(_request, response) {
  const result = await listPendingMigrations();
  response.status(200).json(result);
}

async function postHandler(_request, response) {
  const result = await runPendingMigrations();
  response.status(result.executed.length ? 201 : 200).json(result);
}

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);
