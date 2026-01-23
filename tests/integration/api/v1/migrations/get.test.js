import { orchestrator } from '@/tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});
describe('GET /api/v1/migrations', () => {
  describe('Anonymous user', () => {
    test('Retrieving pending migrations', async () => {
      const response = await fetch('http://localhost:3000/api/v1/migrations');
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(Array.isArray(responseBody.pending)).toBe(true);
      expect(responseBody.pending.length).toBeGreaterThan(0);
      expect(typeof responseBody.pending[0]).toBe('string');
    });
  });
});
