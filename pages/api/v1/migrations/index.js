import { createRouter } from 'next-connect';
import { controller } from '@/infra/controller';
import { migrator } from '@/models/migrator';

async function getHandler(_request, response) {
  const result = await migrator.listPendingMigrations();
  response.status(200).json(result);
}

async function postHandler(_request, response) {
  const result = await migrator.runPendingMigrations();
  response.status(result.executed.length ? 201 : 200).json(result);
}

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);
