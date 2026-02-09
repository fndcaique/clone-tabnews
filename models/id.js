import { version as uuidVersion, v7 as uuidv7 } from 'uuid';

export const Id = {
  generate: () => uuidv7(),
  isValid: (id) => uuidVersion(id) === 7,
};
