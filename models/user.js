import database from '@/infra/database';
import { NotFoundError, ValidationError } from '@/infra/errors';
import { Id } from './id';
import { Password } from './password';

const verifyConstraintErrors = (error) => {
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
};

const insertUser = async (userInputValues) => {
  try {
    const hashedPassword = await Password.hash(userInputValues.password);
    const result = await database.query({
      text: `
        INSERT INTO users
          (id, username, email, password)
        VALUES
          ($1, $2, $3, $4)
        RETURNING
          *
        ;`,
      values: [
        Id.generate(),
        userInputValues.username,
        userInputValues.email,
        hashedPassword,
      ],
    });
    return result.rows[0];
  } catch (error) {
    verifyConstraintErrors(error);
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
        *
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

const selectByEmail = async (email) => {
  const result = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        email = $1
      LIMIT
        1
      ;`,
    values: [email],
  });
  if (!result.rowCount) {
    throw new NotFoundError({
      message: `User with email '${email}' not found`,
      action: 'Verify that the email is correct',
      status_code: 404,
    });
  }
  return result.rows[0];
};

const findOneByEmail = async (email) => {
  const userFound = await selectByEmail(email);
  return userFound;
};

const update = async (username, userInputValues) => {
  const currentUser = await findOneByUsername(username);
  const newUserValues = { ...currentUser };
  if ('username' in userInputValues) {
    newUserValues.username = userInputValues.username;
  }
  if ('email' in userInputValues) {
    newUserValues.email = userInputValues.email;
  }
  if ('password' in userInputValues) {
    newUserValues.password = await Password.hash(userInputValues.password);
  }
  try {
    const results = await database.query({
      text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
      ;`,
      values: [
        newUserValues.id,
        newUserValues.username,
        newUserValues.email,
        newUserValues.password,
      ],
    });
    return results.rows[0];
  } catch (error) {
    verifyConstraintErrors(error);
    throw error;
  }
};

export const User = {
  create,
  findOneByUsername,
  update,
  findOneByEmail,
};
