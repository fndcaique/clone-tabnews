import { databaseSetup } from '@/tests/database-setup';
import { orchestrator } from '@/tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await databaseSetup.cleanDatabase();
});

describe('POST /api/v1/migrations', () => {
  describe('Anonymous user', () => {
    describe('Running pending migrations', () => {
      test('For the first time', async () => {
        const response = await fetch(
          'http://localhost:3000/api/v1/migrations',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: null,
          },
        );
        expect(response.status).toBe(201);
        const responseBody = await response.json();
        expect(Array.isArray(responseBody.executed)).toBe(true);
        expect(responseBody.executed.length).toBeGreaterThan(0);
        expect(typeof responseBody.executed[0]).toBe('string');
      });
      test('For the second time', async () => {
        const response = await fetch(
          'http://localhost:3000/api/v1/migrations',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: null,
          },
        );

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(Array.isArray(responseBody.executed)).toBe(true);
        expect(responseBody.executed.length).toBe(0);
      });
    });
  });
});
