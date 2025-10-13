import database from '@/infra/database';

const cleanDatabase = async () => {
  await database.query('DROP schema public CASCADE');
  await database.query('CREATE schema public');
};

beforeAll(async () => {
  await cleanDatabase();
});

test('GET to /api/v1/migrations should return 200', async () => {
  const response = await fetch('http://localhost:3000/api/v1/migrations');
  expect(response.status).toBe(200);
  const responseBody = await response.json();
  expect(Array.isArray(responseBody.notExecuted)).toBe(true);
  expect(responseBody.notExecuted.length).toBeGreaterThan(0);
  expect(typeof responseBody.notExecuted[0]).toBe('string');
});
