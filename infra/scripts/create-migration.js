import fs from 'node:fs';
import path from 'node:path';
import { DATABASE } from '../config.js';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: the migration name is required.');
  process.exit(1);
}

const filePrefix = Date.now().toString();

const fileName = `${filePrefix}_${migrationName}.js`;

const migrationsDir = DATABASE.migrations.directory;
const filePath = path.resolve(migrationsDir, fileName);

const template = `/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};
`;

if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

fs.writeFileSync(filePath, template);

console.log(`Migration created: ${filePath}`);
