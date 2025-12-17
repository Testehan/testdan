export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const STOCKS_ENDPOINT = `${API_BASE_URL}/stocks`;
export const USERS_ENDPOINT = `${API_BASE_URL}/users`;
export const API_ENDPOINT = `${API_BASE_URL}/api`;

// NextStep (Productivity) API
export const NEXTSTEP_BASE_URL = import.meta.env.VITE_NEXTSTEP_URL || 'http://localhost:8084';
export const NEXTSTEP_ENDPOINT = `${NEXTSTEP_BASE_URL}`;

// Re-exports for convenience
export {
  STOCKS_ENDPOINT as stocks,
  USERS_ENDPOINT as users,
  API_ENDPOINT as api,
};