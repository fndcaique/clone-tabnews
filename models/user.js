import database from '@/infra/database';
import { ValidationError } from '@/infra/errors';
import { Id } from './id';

const insertUser = async (userInputValues) => {
  try {
    const result = await database.query({
      text: `
        INSERT INTO users
          (id, username, email, password)
        VALUES
          ($1, $2, $3, $4)
        RETURNING
          id, username, email, created_at, updated_at
        ;`,
      values: [
        Id.generate(),
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return result.rows[0];
  } catch (error) {
    if (error.cause.code === '23505') {
      if (error.cause.constraint === 'users_username_lowercase_unique_idx') {
        throw new ValidationError({
          message: 'Username already in use',
          action: 'Please try a different username',
        });
      }
      if (error.cause.constraint === 'users_email_lowercase_unique_idx') {
        throw new ValidationError({
          message: 'Email already in use',
          action: 'Please try a different email',
        });
      }
    }
    throw error;
  }
};

const create = async (userInputValues) => {
  const newUser = await insertUser(userInputValues);
  return newUser;
};

export const User = { create };
