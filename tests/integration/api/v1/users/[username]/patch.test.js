import { Password } from '@/models/password';
import { User } from '@/models/user';
import { orchestrator } from '@/tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('PATCH /api/v1/users/[username]', () => {
  describe('Anonymous user', () => {
    test(`With nonexistent username`, async () => {
      const response = await fetch(
        'http://localhost:3000/api/v1/users/nonexistentuser',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'newemail@example.com',
            password: 'newpassword',
          }),
        },
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
    test('With duplicated username', async () => {
      const username1 = 'DuplicatedUsername';
      const username2 = 'DuplicatedUsername2';
      await orchestrator.user.create({
        username: username1,
      });

      await orchestrator.user.create({
        username: username2,
      });

      const response3 = await fetch(
        `http://localhost:3000/api/v1/users/${username2}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username1,
          }),
        },
      );

      expect(response3.status).toBe(400);
      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        name: 'ValidationError',
        message: 'Username already in use',
        action: 'Please try a different username',
        status_code: 400,
      });
    });
    test('With duplicated email', async () => {
      const email1 = 'duplicateduemail1@example.com';
      const email2 = 'duplicateduemail2@example.com';
      await orchestrator.user.create({
        email: email1,
      });

      const user2 = await orchestrator.user.create({
        email: email2,
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user2.username}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email1,
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: 'ValidationError',
        message: 'Email already in use',
        action: 'Please try a different email',
        status_code: 400,
      });
    });
    test('With unique username', async () => {
      const username = 'uniqueusername';
      const username2 = 'uniqueusername2';

      const user = await orchestrator.user.create({
        username,
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${username}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username2,
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: user.id,
        username: username2,
        email: user.email,
        created_at: user.created_at.toISOString(),
        updated_at: expect.any(String),
      });

      expect(user.updated_at.getTime()).toBeLessThan(
        new Date(responseBody.updated_at).getTime(),
      );

      const userFound = await User.findOneByUsername(username2);
      expect(userFound.updated_at.toISOString()).toBe(responseBody.updated_at);
    });
    test('With my own username but in different casing', async () => {
      const username = 'MyOwnUsername';
      const username2 = username.toLowerCase();

      const user = await orchestrator.user.create({
        username,
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${username}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username2,
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody2 = await response.json();

      expect(responseBody2).toEqual({
        id: user.id,
        username: username2,
        email: user.email,
        created_at: user.created_at.toISOString(),
        updated_at: expect.any(String),
      });

      expect(user.updated_at.getTime()).toBeLessThan(
        new Date(responseBody2.updated_at).getTime(),
      );

      const userFound = await User.findOneByUsername(username2);
      expect(userFound.updated_at.toISOString()).toBe(responseBody2.updated_at);
    });
    test('With unique email', async () => {
      const username = 'uniqueemail';
      const email = 'uniqueemail@example.com';
      const email2 = 'uniqueemail2@example.com';

      const user = await orchestrator.user.create({
        username,
        email,
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${username}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email2,
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: user.id,
        username,
        email: email2,
        created_at: user.created_at.toISOString(),
        updated_at: expect.any(String),
      });

      expect(user.updated_at.getTime()).toBeLessThan(
        new Date(responseBody.updated_at).getTime(),
      );

      const userFound = await User.findOneByUsername(username);
      expect(userFound.updated_at.toISOString()).toBe(responseBody.updated_at);
    });
    test('With a new password', async () => {
      const username = 'newpassword';
      const email = 'newpassword@example.com';
      const password = 'password';
      const password2 = 'password2';
      const userCreated = await orchestrator.user.create({
        username: username,
        email: email,
        password,
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${username}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: password2,
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: userCreated.id,
        username,
        email,
        created_at: userCreated.created_at.toISOString(),
        updated_at: expect.any(String),
      });

      expect(new Date(userCreated.updated_at).getTime()).toBeLessThan(
        new Date(responseBody.updated_at).getTime(),
      );

      const userFound = await User.findOneByUsername(username);
      expect(userFound.updated_at.toISOString()).toBe(responseBody.updated_at);

      expect(userFound.password).not.toBe(password);
      expect(userFound.password).not.toBe(password2);
      expect(await Password.compare(password, userFound.password)).toBe(false);
      expect(await Password.compare(password2, userFound.password)).toBe(true);
    });
  });
});
