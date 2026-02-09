import database from '@/infra/database';
import { NotFoundError, ValidationError } from '@/infra/errors';
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

const selectByUsername = async (username) => {
  const result = await database.query({
    text: `
      SELECT
        id, username, email, created_at, updated_at
      FROM
        users
      WHERE
        LOWER(username) = $1
      LIMIT
        1
      ;`,
    values: [username.toLowerCase()],
  });
  if (!result.rowCount) {
    throw new NotFoundError({
      message: `User with username '${username}' not found`,
      action: 'Verify that the username is correct',
      status_code: 404,
    });
  }
  return result.rows[0];
};

const findOneByUsername = async (username) => {
  const userFound = await selectByUsername(username);
  return userFound;
};

export const User = { create, findOneByUsername };
