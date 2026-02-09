import { Id } from '@/models/id';
import { orchestrator } from '@/tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('POST /api/v1/users/[username]', () => {
  describe('Anonymous user', () => {
    test(`With exact case match`, async () => {
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'SameCase',
          email: 'samecase@gmail.com',
          password: 'senha',
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        'http://localhost:3000/api/v1/users/SameCase',
      );
      expect(response2.status).toBe(200);
      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        id: response2Body.id,
        username: 'SameCase',
        email: 'samecase@gmail.com',
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });
      expect(Id.isValid(response2Body.id)).toBe(true);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });
    test(`With exact case mismatch`, async () => {
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'DifferentCase',
          email: 'differentcase@gmail.com',
          password: 'password',
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        'http://localhost:3000/api/v1/users/differentcase',
      );
      expect(response2.status).toBe(200);
      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        id: response2Body.id,
        username: 'DifferentCase',
        email: 'differentcase@gmail.com',
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });
      expect(Id.isValid(response2Body.id)).toBe(true);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
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
