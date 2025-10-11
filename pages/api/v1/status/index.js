import database from 'infra/database';

export default async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const {
    rows: [{ server_version }],
  } = await database.query('SHOW server_version;');

  const {
    rows: [{ max_connections }],
  } = await database.query('SHOW max_connections;');

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        server_version,
        max_connections: Number.parseInt(max_connections, 10),
      },
    },
  });
}
