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
      const email1 = 'duplicateusername1@example.com';
      const email2 = 'duplicateusername2@example.com';
      const password = 'password';
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username1,
          email: email1,
          password,
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
          email: email2,
          password,
        }),
      });

      expect(response2.status).toBe(201);

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
      const username1 = 'DuplicatedEmail';
      const username2 = 'DuplicatedEmail2';
      const email1 = 'duplicateduemail1@example.com';
      const email2 = 'duplicateduemail2@example.com';
      const password = 'password';
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username1,
          email: email1,
          password,
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
          email: email2,
          password,
        }),
      });

      expect(response2.status).toBe(201);

      const response3 = await fetch(
        `http://localhost:3000/api/v1/users/${username2}`,
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

      expect(response3.status).toBe(400);
      const response3Body = await response3.json();
      expect(response3Body).toEqual({
        name: 'ValidationError',
        message: 'Email already in use',
        action: 'Please try a different email',
        status_code: 400,
      });
    });
    test('With unique username', async () => {
      const username = 'uniqueusername';
      const username2 = 'uniqueusername2';
      const email = 'uniqueusername@example.com';
      const password = 'password';
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password,
        }),
      });

      expect(response1.status).toBe(201);

      const responseBody1 = await response1.json();

      const response2 = await fetch(
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

      expect(response2.status).toBe(200);

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        id: responseBody1.id,
        username: username2,
        email: email,
        created_at: responseBody1.created_at,
        updated_at: expect.any(String),
      });

      expect(new Date(responseBody1.updated_at).getTime()).toBeLessThan(
        new Date(responseBody2.updated_at).getTime(),
      );

      const userFound = await User.findOneByUsername(username2);
      expect(userFound.updated_at.toISOString()).toBe(responseBody2.updated_at);
    });
    test('With my own username but in different casing', async () => {
      const username = 'MyOwnUsername';
      const username2 = username.toLowerCase();
      const email = 'myownusername@example.com';
      const password = 'password';
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password,
        }),
      });

      expect(response1.status).toBe(201);

      const responseBody1 = await response1.json();

      const response2 = await fetch(
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

      expect(response2.status).toBe(200);

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        id: responseBody1.id,
        username: username2,
        email,
        created_at: responseBody1.created_at,
        updated_at: expect.any(String),
      });

      expect(new Date(responseBody1.updated_at).getTime()).toBeLessThan(
        new Date(responseBody2.updated_at).getTime(),
      );

      const userFound = await User.findOneByUsername(username2);
      expect(userFound.updated_at.toISOString()).toBe(responseBody2.updated_at);
    });
    test('With unique email', async () => {
      const username = 'uniqueemail';
      const email = 'uniqueemail@example.com';
      const email2 = 'uniqueemail2@example.com';
      const password = 'password';
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password,
        }),
      });

      expect(response1.status).toBe(201);

      const responseBody1 = await response1.json();

      const response2 = await fetch(
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

      expect(response2.status).toBe(200);

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        id: responseBody1.id,
        username,
        email: email2,
        created_at: responseBody1.created_at,
        updated_at: expect.any(String),
      });

      expect(new Date(responseBody1.updated_at).getTime()).toBeLessThan(
        new Date(responseBody2.updated_at).getTime(),
      );

      const userFound = await User.findOneByUsername(username);
      expect(userFound.updated_at.toISOString()).toBe(responseBody2.updated_at);
    });
    test('With a new password', async () => {
      const username = 'newpassword';
      const email = 'newpassword@example.com';
      const password = 'password';
      const password2 = 'password2';
      const response1 = await fetch('http://localhost:3000/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password,
        }),
      });

      expect(response1.status).toBe(201);

      const responseBody1 = await response1.json();

      const response2 = await fetch(
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

      expect(response2.status).toBe(200);

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        id: responseBody1.id,
        username,
        email,
        created_at: responseBody1.created_at,
        updated_at: expect.any(String),
      });

      expect(new Date(responseBody1.updated_at).getTime()).toBeLessThan(
        new Date(responseBody2.updated_at).getTime(),
      );

      const userFound = await User.findOneByUsername(username);
      expect(userFound.updated_at.toISOString()).toBe(responseBody2.updated_at);

      expect(userFound.password).not.toBe(password);
      expect(userFound.password).not.toBe(password2);
      expect(await Password.compare(password, userFound.password)).toBe(false);
      expect(await Password.compare(password2, userFound.password)).toBe(true);
    });
  });
});
