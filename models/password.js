import bcrypt from 'bcrypt';
import { SECRET } from '@/infra/config';

const hash = async (password) => {
  const rounds = SECRET.rounds;
  const salt = await bcrypt.genSalt(rounds);
  return await bcrypt.hash(password + SECRET.pepper, salt);
};

const compare = async (password, hash) => {
  return await bcrypt.compare(password + SECRET.pepper, hash);
};

export const Password = {
  hash,
  compare,
};
