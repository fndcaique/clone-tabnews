import { databaseSetup } from '@/tests/database-setup';
import { orchestrator } from '@/tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await databaseSetup.cleanDatabase();
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
  expect(Array.isArray(responseBody.executed)).toBe(true);
  expect(responseBody.executed.length).toBeGreaterThan(0);
  expect(typeof responseBody.executed[0]).toBe('string');

  response = await fetch('http://localhost:3000/api/v1/migrations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: null,
  });

  expect(response.status).toBe(200);
  responseBody = await response.json();
  expect(Array.isArray(responseBody.executed)).toBe(true);
  expect(responseBody.executed.length).toBe(0);
});
