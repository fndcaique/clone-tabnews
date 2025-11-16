import AsyncRetry from 'async-retry';

const fetchStatusPage = async () => {
  const response = await fetch('http://localhost:3000/api/v1/status');
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
};
const waitForWebServer = async () => {
  return await AsyncRetry(fetchStatusPage, {
    retries: 100,
    maxTimeout: 1000,
    onRetry: (error, attempt) => {
      console.log(`Attempt ${attempt} failed. Reason: ${error.message}`);
    },
  });
};
const waitForAllServices = async () => {
  await waitForWebServer();
};

export const orchestrator = {
  waitForAllServices,
};
