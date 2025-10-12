import database from 'infra/database';

export default async function migrations(request, response) {
  const listMigrations = async () => {
    const connection = await database.connection();
    try {
      return await connection.migrate.list();
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await connection.destroy();
    }
  };

  const result = await listMigrations();

  response.status(200).json(result);
}
