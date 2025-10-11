test('GET to /api/v1/status should return 200', async () => {
  const dateNow = new Date();
  const response = await fetch('http://localhost:3000/api/v1/status');
  expect(response.status).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('updated_at');
  const statusDate = new Date(responseBody.updated_at);
  expect(statusDate).toBeInstanceOf(Date);
  expect(statusDate.getTime()).toBeGreaterThanOrEqual(dateNow.getTime());
  expect(responseBody.dependencies).toBeDefined();
  expect(responseBody.dependencies.database).toBeDefined();
  expect(responseBody.dependencies.database.server_version).toBe('16.0');
  expect(typeof responseBody.dependencies.database.max_connections).toBe(
    'number',
  );
  expect(responseBody.dependencies.database.open_connections).toBe(1);
});
