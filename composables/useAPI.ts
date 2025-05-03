export const useApi = () => {
  const baseUrl = 'http://localhost:64203';

  const get = async (endpoint: string) => {
    const url = `${baseUrl}${endpoint}`;
    console.log('Fetching (raw):', url);

    try {
      const res = await fetch(url);
      const json = await res.json();
      console.log('Raw fetch success:', json);
      return json;
    } catch (err) {
      console.error('Raw fetch failed:', err);
      return null;
    }
  };

  return { get };
};
