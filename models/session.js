import crypto from 'node:crypto';
import database from '@/infra/database';
import { Id } from './id';

const insertSession = async (
  id,
  token,
  userId,
  expiresAt,
  createdAt,
  updatedAt,
) => {
  const result = await database.query({
    text: `
      INSERT INTO
        sessions (id, token, user_id, expires_at, created_at, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING
        *
      ;`,
    values: [id, token, userId, expiresAt, createdAt, updatedAt],
  });
  return result.rows[0];
};

const EXPIRATION_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 7; // 7 days

export const Session = {
  EXPIRATION_IN_MILLISECONDS,
  create: async (userId) => {
    const id = Id.generate();
    const token = crypto.randomBytes(48).toString('hex');
    const createdAt = new Date();
    const updatedAt = new Date(createdAt);
    const expiresAt = new Date(
      createdAt.getTime() + EXPIRATION_IN_MILLISECONDS,
    );
    const session = await insertSession(
      id,
      token,
      userId,
      expiresAt,
      createdAt,
      updatedAt,
    );
    return session;
  },
};
