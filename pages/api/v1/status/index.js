import { DATABASE } from '@/infra/config';
import database from '@/infra/database';

export default async function status(_request, response) {
  const updatedAt = new Date().toISOString();
  const showVersionQueryResult = await database.query('SHOW server_version;');

  const {
    rows: [{ server_version: version }],
  } = showVersionQueryResult;

  const {
    rows: [{ max_connections }],
  } = await database.query('SHOW max_connections;');

  const {
    rows: [{ opened_connections }],
  } = await database.query(
    'SELECT COUNT(*) AS opened_connections FROM pg_stat_activity WHERE datname = $1;',
    [DATABASE.database],
  );

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version,
        max_connections: Number.parseInt(max_connections, 10),
        opened_connections: Number.parseInt(opened_connections, 10),
      },
    },
  });
}
