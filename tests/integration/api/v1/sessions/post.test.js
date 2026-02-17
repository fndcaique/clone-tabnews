import cookie from 'cookie';
import { Id } from '@/models/id';
import { Session } from '@/models/session';
import { orchestrator } from '@/tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('POST /api/v1/sessions', () => {
  describe('Anonymous user', () => {
    test('With incorrect `email` but correct `password`', async () => {
      const password = 'pwd123';
      await orchestrator.user.create({ password });
      const response = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'incorrectemail@gmail.com',
          password,
        }),
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: 'UnauthorizedError',
        message: 'Invalid credentials',
        action: 'Verify that the credentials are correct',
        status_code: 401,
      });
    });

    test('With correct `email` but incorrect `password`', async () => {
      const email = 'correctemail@gmail.com';
      await orchestrator.user.create({ email });
      const response = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: 'incorrectpassword',
        }),
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: 'UnauthorizedError',
        message: 'Invalid credentials',
        action: 'Verify that the credentials are correct',
        status_code: 401,
      });
    });

    test('With incorrect `email` and incorrect `password`', async () => {
      await orchestrator.user.create();
      const response = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'incorrectemail@gmail.com',
          password: 'incorrectpassword',
        }),
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: 'UnauthorizedError',
        message: 'Invalid credentials',
        action: 'Verify that the credentials are correct',
        status_code: 401,
      });
    });

    test('With correct credentials', async () => {
      const password = 'pwd123';
      const email = 'correctemailandpassword@gmail.com';
      const user = await orchestrator.user.create({ email, password });
      const response = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: expect.any(String),
        user_id: user.id,
        token: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
        expires_at: expect.any(String),
      });

      expect(Id.isValid(responseBody.id)).toBe(true);
      expect(responseBody.token).toHaveLength(96);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(responseBody.updated_at).toBe(responseBody.created_at);
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Session.EXPIRATION_IN_MILLISECONDS).toBe(1000 * 60 * 60 * 24 * 7);
      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);
      expect(expiresAt.toISOString()).toBe(
        new Date(
          createdAt.getTime() + Session.EXPIRATION_IN_MILLISECONDS,
        ).toISOString(),
      );
      const setCookieHeader = response.headers.get('Set-Cookie');
      expect(setCookieHeader).toBeTruthy();
      expect(setCookieHeader).toContain('HttpOnly;');
      const setCookieParsed = cookie.parse(setCookieHeader);
      expect(setCookieParsed).toEqual({
        'Max-Age': (Session.EXPIRATION_IN_MILLISECONDS / 1000).toString(),
        SameSite: 'Strict',
        Path: '/',
        session_id: expect.any(String),
      });
      expect(setCookieParsed.session_id).toHaveLength(96);
    });
  });
});
