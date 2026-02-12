import { createRouter } from 'next-connect';
import { controller } from '@/infra/controller';
import { User } from '@/models/user';

async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await User.findOneByUsername(username);
  delete userFound.password;
  response.status(200).json(userFound);
}

const router = createRouter();
router.get(getHandler);

export default router.handler(controller.errorHandlers);
