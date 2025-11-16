import database from '@/infra/database';

const cleanDatabase = async () => {
  await database.query('DROP schema public CASCADE; CREATE schema public;');
};

export const databaseSetup = {
  cleanDatabase,
};
