import { createRouter } from 'next-connect';
import { controller } from '@/infra/controller';
import { User } from '@/models/user';

async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await User.findOneByUsername(username);
  delete userFound.password;
  response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;
  const updatedUser = await User.update(username, userInputValues);
  delete updatedUser.password;
  response.status(200).json(updatedUser);
}

const router = createRouter();
router.get(getHandler).patch(patchHandler);

export default router.handler(controller.errorHandlers);
