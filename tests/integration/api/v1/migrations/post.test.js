import database from '@/infra/database';

const cleanDatabase = async () => {
  await database.query('DROP schema public CASCADE');
  await database.query('CREATE schema public');
};

beforeAll(async () => {
  await cleanDatabase();
});

test('POST to /api/v1/migrations should return 200', async () => {
  let response = await fetch('http://localhost:3000/api/v1/migrations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: null,
  });
  expect(response.status).toBe(201);
  let responseBody = await response.json();
  expect(typeof responseBody.batch).toBe('number');
  expect(responseBody.batch).toBe(1);
  expect(Array.isArray(responseBody.executed)).toBe(true);
  expect(responseBody.executed.length).toBeGreaterThan(0);

  response = await fetch('http://localhost:3000/api/v1/migrations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: null,
  });

  expect(response.status).toBe(200);
  responseBody = await response.json();
  expect(typeof responseBody.batch).toBe('number');
  expect(responseBody.batch).toBe(2);
  expect(Array.isArray(responseBody.executed)).toBe(true);
  expect(responseBody.executed.length).toBe(0);
});
