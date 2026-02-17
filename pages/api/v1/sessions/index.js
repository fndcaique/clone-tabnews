import cookie from 'cookie';
import { createRouter } from 'next-connect';
import { controller } from '@/infra/controller';
import { Authentication } from '@/models/authentication';
import { Session } from '@/models/session';

async function postHandler(request, response) {
  const { email, password } = request.body;
  const authenticatedUser = await Authentication.getAuthenticatedUser(
    email,
    password,
  );
  const newSession = await Session.create(authenticatedUser.id);

  const setCookie = cookie.serialize('session_id', newSession.token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: Session.EXPIRATION_IN_MILLISECONDS / 1000,
    sameSite: 'strict',
  });

  response.setHeader('Set-Cookie', setCookie);

  response.status(201).json(newSession);
}

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);
