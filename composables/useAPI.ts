export const useApi = () => {
  const baseUrl = 'https://your-umbraco-instance.com'; // Replace later

  const get = async (endpoint: string) => {
    try {
      const { data, error } = await useFetch(`${baseUrl}${endpoint}`);
      if (error.value) throw new Error(error.value.message);
      return data.value;
    } catch (err) {
      console.error('API GET error:', err);
      return null;
    }
  };

  return { get };
};
