import { exec } from 'node:child_process';

const checkPostgres = () => {
  const handleReturn = (_error, stdout) => {
    if (stdout.search('accepting connections') === -1) {
      process.stdout.write('.');
      checkPostgres();
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
