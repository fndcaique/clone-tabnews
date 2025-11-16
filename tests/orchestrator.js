import AsyncRetry from 'async-retry';

const fetchStatusPage = async () => {
  const response = await fetch('http://localhost:3000/api/v1/status');
  if (!response.ok) {
    throw new Error(`Status page not available`);
  }
  return;
};
const waitForWebServer = async () => {
  return await AsyncRetry(fetchStatusPage, {
    retries: 100,
    maxTimeout: 1000,
  });
};
const waitForAllServices = async () => {
  await waitForWebServer();
};

export const orchestrator = {
  waitForAllServices,
};
