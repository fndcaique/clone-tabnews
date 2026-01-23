import { exec } from 'node:child_process';

const MAX_RETRIES = 30;
const RETRY_DELAY = 1000;
let retries = 0;

const checkPostgres = () => {
  const handleReturn = (_error, stdout) => {
    if (stdout.search('accepting connections') === -1) {
      process.stdout.write('.');
      retries++;
      if (retries >= MAX_RETRIES) {
        process.stdout.write('\n\n❌ PostgreSQL failed to start\n');
        process.exit(1);
      }
      setTimeout(checkPostgres, RETRY_DELAY);
      return;
    }
    process.stdout.write('\n\n🟢 PostgreSQL is ready!\n');
  };
  exec(
    'docker exec postgres-clone-tabnews pg_isready --host localhost --port 5432 --username postgres',
    handleReturn,
  );
};

process.stdout.write('\n\n🔴 Waiting for PostgreSQL...');

checkPostgres();
