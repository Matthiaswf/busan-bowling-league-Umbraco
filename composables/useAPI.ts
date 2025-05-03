export const useApi = () => {
  const baseUrl = 'https://localhost:44307'; // Use your actual API base

  const get = async (endpoint: string) => {
    try {
      const { data, error } = await useFetch(`${baseUrl}${endpoint}`, {
        // Disable SSR fetch since it's local and not trusted
        server: false,
      });
      if (error.value) throw new Error(error.value.message);
      return data.value;
    } catch (err) {
      console.error('API GET error:', err);
      return null;
    }
  };

  return { get };
};
