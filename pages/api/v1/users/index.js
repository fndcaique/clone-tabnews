import { createRouter } from 'next-connect';
import { controller } from '@/infra/controller';
import { User } from '@/models/user';

async function postHandler(request, response) {
  const userInputValues = request.body;
  const newUser = await User.create(userInputValues);
  delete newUser.password;
  response.status(201).json(newUser);
}

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);
