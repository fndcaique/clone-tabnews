import database from 'infra/database';

export default async function status(request, response) {
  const {
    rows: [result],
  } = await database.query('SELECT (1 + 1) as sum;');
  console.log({ result });
  response.status(200).json({ status: 'ok' });
}
