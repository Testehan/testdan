export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const STOCKS_ENDPOINT = `${API_BASE_URL}/stocks`;
export const USERS_ENDPOINT = `${API_BASE_URL}/users`;
export const API_ENDPOINT = `${API_BASE_URL}/api`;

// NextStep (Productivity) API
export const NEXTSTEP_BASE_URL = import.meta.env.VITE_NEXTSTEP_URL || 'http://localhost:8084';
export const NEXTSTEP_ENDPOINT = `${NEXTSTEP_BASE_URL}`;

// NextStep API secret key
const secretKey = import.meta.env.VITE_NEXTSTEP_API_SECRET_KEY || '';
export const NEXTSTEP_API_SECRET = secretKey;

// Wrapper for NextStep API calls with authorization header
export async function nextstepFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (NEXTSTEP_API_SECRET) {
    headers.set('Authorization', `Bearer ${NEXTSTEP_API_SECRET}`);
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    throw new Error('System Configuration Error: Invalid API key');
  }
  
  return response;
}

// Re-exports for convenience
export {
  STOCKS_ENDPOINT as stocks,
  USERS_ENDPOINT as users,
  API_ENDPOINT as api,
};