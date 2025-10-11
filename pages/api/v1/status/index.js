import database from 'infra/database';

export default async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const {
    rows: [{ server_version }],
  } = await database.query('SHOW server_version');
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: { version: server_version },
    },
  });
}
