export const useApi = () => {
  const baseUrl = 'http://localhost:64203';

  const get = async (endpoint: string) => {
    const url = `${baseUrl}${endpoint}`;

    try {
      const res = await fetch(url);
      const json = await res.json();

      return json;
    } catch (err) {
      return null;
    }
  };

  return { get };
};
