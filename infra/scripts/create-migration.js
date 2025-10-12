import fs from 'node:fs';
import path from 'node:path';
import KnexConfig from '../knexconfig.js';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: the migration name is required.');
  process.exit(1);
}

const filePrefix = new Date().toISOString().substring(0, 19).replace(/\D/g, '');

const fileName = `${filePrefix}_${migrationName}.js`;

const env = process.env.NODE_ENV || 'development';

const migrationsDir = KnexConfig[env].migrations.directory;
const filePath = path.join(migrationsDir, fileName);

// Template básico de migration Knex
const template = `/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {}
`;

if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

fs.writeFileSync(filePath, template);

console.log(`Migration created: ${filePath}`);
