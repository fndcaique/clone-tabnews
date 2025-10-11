import database from 'infra/database';

export default async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const {
    rows: [{ server_version }],
  } = await database.query('SHOW server_version;');

  const {
    rows: [{ max_connections }],
  } = await database.query('SHOW max_connections;');

  const {
    rows: [{ open_connections }],
  } = await database.query(
    'SELECT numbackends AS open_connections FROM pg_stat_database WHERE datname = $1;',
    [process.env.POSTGRES_DB],
  );

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        server_version,
        max_connections: Number.parseInt(max_connections, 10),
        open_connections,
      },
    },
  });
}
