import database from '@/infra/database';

export default async function migrations(request, response) {
  if (request.method === 'GET') {
    const listMigrations = async () => {
      const connection = await database.connection();
      try {
        const [_migrationsExecuted, migrationsNotExecuted] =
          await connection.migrate.list();
        const notExecuted = migrationsNotExecuted.map(({ file }) => file);
        return { notExecuted };
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
  if (request.method === 'POST') {
    const runMigrations = async () => {
      const connection = await database.connection();
      try {
        const [batch, executed] = await connection.migrate.latest();
        return { batch, executed };
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        await connection.destroy();
      }
    };

    const result = await runMigrations();

    response.status(result.executed.length ? 201 : 200).json(result);
  }

  return response.status(405).end();
}
