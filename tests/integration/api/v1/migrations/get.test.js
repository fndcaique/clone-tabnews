test('GET to /api/v1/migrations should return 200', async () => {
  const response = await fetch('http://localhost:3000/api/v1/migrations');
  expect(response.status).toBe(200);
  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBe(2);
  expect(Array.isArray(responseBody[0])).toBe(true);
  expect(Array.isArray(responseBody[1])).toBe(true);
});
