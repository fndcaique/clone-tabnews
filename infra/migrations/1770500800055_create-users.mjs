/**
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
export const up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      notNull: true,
      primaryKey: true,
    },
    username: {
      type: 'varchar(32)',
      notNull: true,
    },
    email: {
      type: 'varchar(254)', // maximum length of an email address
      notNull: true,
    },
    password: {
      type: 'varchar(60)', // length of a bcrypt hash
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
  pgm.sql(`
    CREATE UNIQUE INDEX users_username_lowercase_unique_idx ON users (LOWER(username));
  `);
  pgm.sql(`
    CREATE UNIQUE INDEX users_email_lowercase_unique_idx ON users (LOWER(email));
  `);
  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_updated_at_utc()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = timezone('utc', now());
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  pgm.sql(`
    CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_utc();
  `);
};

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
