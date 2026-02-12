import { Id } from '@/models/id';
import { Password } from '@/models/password';
import { User } from '@/models/user';
import { orchestrator } from '@/tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('POST /api/v1/users', () => {
  describe('Anonymous user', () => {
    test('With unique and valid data', async () => {
      const wrongPassword = 'Password';
      const data = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password',
      };
      const response = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: data.username,
        email: data.email,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(Id.isValid(responseBody.id)).toBe(true);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const user = await User.findOneByUsername(data.username);

      const hashedPassword = user.password;
      expect(hashedPassword).not.toBe(data.password);

      expect(await Password.compare(data.password, hashedPassword)).toBe(true);
      expect(await Password.compare(wrongPassword, hashedPassword)).toBe(false);
    });
    test(`With duplicated 'email'`, async () => {
      const username1 = 'testemail';
      const username2 = 'testemailduplicated';
      const email = 'duplicatedemail@example.com';
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username1,
          email: email,
          password: 'senha',
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username2,
          email: email,
          password: 'senha',
        }),
      });

      expect(response2.status).toBe(400);
      const responseBody2 = await response2.json();
      expect(responseBody2).toEqual({
        name: 'ValidationError',
        message: 'Email already in use',
        action: 'Please try a different email',
        status_code: 400,
      });
    });
    test('With duplicated username', async () => {
      const username = 'TestDuplicatedUsername';
      const email1 = 'duplicatedusername1@example.com';
      const email2 = 'duplicatedusername2@example.com';
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email1,
          password: 'senha',
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email2,
          password: 'senha',
        }),
      });

      expect(response2.status).toBe(400);
      const responseBody2 = await response2.json();
      expect(responseBody2).toEqual({
        name: 'ValidationError',
        message: 'Username already in use',
        action: 'Please try a different username',
        status_code: 400,
      });
    });
  });
});
