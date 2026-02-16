import { Id } from '@/models/id';
import { orchestrator } from '@/tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('GET /api/v1/users/[username]', () => {
  describe('Anonymous user', () => {
    test(`With exact case match`, async () => {
      await orchestrator.user.create({
        username: 'SameCase',
        email: 'samecase@gmail.com',
        password: 'senha',
      });

      const response = await fetch(
        'http://localhost:3000/api/v1/users/SameCase',
      );
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: 'SameCase',
        email: 'samecase@gmail.com',
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(Id.isValid(responseBody.id)).toBe(true);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });
    test(`With exact case mismatch`, async () => {
      await orchestrator.user.create({
        username: 'DifferentCase',
        email: 'differentcase@gmail.com',
        password: 'password',
      });

      const response = await fetch(
        'http://localhost:3000/api/v1/users/differentcase',
      );
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: 'DifferentCase',
        email: 'differentcase@gmail.com',
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(Id.isValid(responseBody.id)).toBe(true);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });
    test(`With nonexistent username`, async () => {
      const response = await fetch(
        'http://localhost:3000/api/v1/users/nonexistentuser',
      );
      expect(response.status).toBe(404);
      const response2Body = await response.json();
      expect(response2Body).toEqual({
        name: 'NotFoundError',
        message: `User with username 'nonexistentuser' not found`,
        action: 'Verify that the username is correct',
        status_code: 404,
      });
    });
  });
});
