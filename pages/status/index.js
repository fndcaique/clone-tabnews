import useSWR from 'swr';

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  const response = useSWR('/api/v1/status', fetchAPI, {
    refreshInterval: 2000,
  });

  return (
    <div>
      <h1>Status Page</h1>
      <pre>{JSON.stringify(response.data, null, 2)}</pre>
    </div>
  );
}
