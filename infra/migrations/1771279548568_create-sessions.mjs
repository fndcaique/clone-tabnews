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
  pgm.createTable('sessions', {
    id: {
      type: 'uuid',
      notNull: true,
      primaryKey: true,
    },
    token: {
      type: 'varchar(96)',
      notNull: true,
      unique: true,
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
    },
    expires_at: {
      type: 'timestamptz',
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
    CREATE TRIGGER set_sessions_updated_at
    BEFORE UPDATE ON sessions
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
