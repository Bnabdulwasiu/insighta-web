import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, // send HTTP-only cookies automatically
  headers: {
    'X-API-Version': '1',
  },
});

// ── Silent token refresh on 401 ───────────────────────────────────────────────
// Attempt a single refresh before kicking the user to login.
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error) => {
  refreshQueue.forEach((cb) => (error ? cb.reject(error) : cb.resolve()));
  refreshQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only intercept 401s that haven't been retried yet
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // Queue any concurrent requests while refresh is in progress
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then(() => client(original))
          .catch((e) => Promise.reject(e));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          'http://localhost:8000/auth/web/refresh',
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return client(original); // retry the original request
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — session is truly expired
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
