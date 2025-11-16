import { databaseSetup } from '@/tests/database-setup';
import { orchestrator } from '@/tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await databaseSetup.cleanDatabase();
});

test('GET to /api/v1/migrations should return 200', async () => {
  const response = await fetch('http://localhost:3000/api/v1/migrations');
  expect(response.status).toBe(200);
  const responseBody = await response.json();
  expect(Array.isArray(responseBody.pending)).toBe(true);
  expect(responseBody.pending.length).toBeGreaterThan(0);
  expect(typeof responseBody.pending[0]).toBe('string');
});
