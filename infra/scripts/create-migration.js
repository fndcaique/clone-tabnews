import fs from 'node:fs';
import path from 'node:path';
import { DATABASE } from '../config.js';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: the migration name is required.');
  process.exit(1);
}

const filePrefix = Date.now().toString();
const fileName = `${filePrefix}_${migrationName}.mjs`;

const migrationsDir = DATABASE.migrations.directory;
const filePath = path.resolve(migrationsDir, fileName);

const template = `/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Apply the migration (forward-only).
 *
 * IMPORTANT:
 * This project adopts a forward-only migration strategy.
 * Database changes are considered irreversible once applied in production.
 *
 * In case of an issue:
 * - Roll back application code if needed
 * - Fix the database state with a new migration (fix forward)
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {};

/**
 * Rollback migration.
 *
 * WHY THIS IS DISABLED:
 * - Most schema changes are not safely reversible
 * - Data loss cannot be undone
 * - Production rollbacks should not rely on database downgrades
 *
 * This is intentionally disabled to enforce forward-only migrations.
 */
export const down = false;
`;

if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

fs.writeFileSync(filePath, template);

console.log(`Migration created: ${filePath}`);
