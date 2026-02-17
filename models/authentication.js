import { NotFoundError, UnauthorizedError } from '@/infra/errors';
import { Password } from './password';
import { User } from './user';

const findUserByEmail = async (email) => {
  try {
    const userFound = await User.findOneByEmail(email);
    return userFound;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({ message: 'Invalid email' });
    }
    throw error;
  }
};

const validatePassword = async (user, password) => {
  const passwordMatch = await Password.compare(password, user.password);
  if (!passwordMatch) {
    throw new UnauthorizedError({ message: 'Invalid password' });
  }
};

const getAuthenticatedUser = async (email, password) => {
  try {
    const userFound = await findUserByEmail(email);
    await validatePassword(userFound, password);
    return userFound;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({ message: 'Invalid credentials' });
    }
    throw error;
  }
};

export const Authentication = {
  getAuthenticatedUser,
};
