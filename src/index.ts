import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types for configuration
export interface Storage {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

export interface AuthConfig {
  type: 'bearer' | 'oauth2' | 'apiKey' | 'custom';
  tokenKey?: string; // Key for token storage (e.g., 'access')
  apiKey?: string; // For API key authentication
  customHeader?: string; // Custom header name for auth (e.g., 'X-API-Key')
  customAuthValue?: string; // Custom auth value for the header
  oauth2?: {
    tokenUrl: string; // OAuth2 token endpoint
    clientId: string;
    clientSecret?: string;
    grantType?: 'client_credentials' | 'authorization_code' | 'refresh_token';
    scope?: string;
    refreshTokenKey?: string; // Key for refresh token storage
  };
}

export interface ApiConfig {
  baseURL?: string;
  storage?: Storage; // Custom storage (defaults to localStorage)
  auth?: AuthConfig;
  headers?: Record<string, string>;
}

export function createApiClient(config: ApiConfig = {}): AxiosInstance {
  // Default storage: localStorage
  const defaultStorage: Storage = {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
  };

  const storage = config.storage || defaultStorage;
  const baseURL = config.baseURL || 'your-api';
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...config.headers,
  };

  // Create Axios instance
  const api = axios.create({
    baseURL,
    headers,
  });

  // Request interceptor for authentication
  api.interceptors.request.use(
    async (axiosConfig) => {
      if (!config.auth) {
        return axiosConfig;
      }

      switch (config.auth.type) {
        case 'bearer': {
          const token = await storage.getItem(config.auth.tokenKey || 'access');
          if (token) {
            axiosConfig.headers.Authorization = `Bearer ${token}`;
          } else {
            console.log('No Bearer token detected');
          }
          break;
        }
        case 'apiKey': {
          if (config.auth.apiKey && config.auth.customHeader) {
            axiosConfig.headers[config.auth.customHeader] = config.auth.apiKey;
          }
          break;
        }
        case 'custom': {
          if (config.auth.customHeader && config.auth.customAuthValue) {
            axiosConfig.headers[config.auth.customHeader] = config.auth.customAuthValue;
          }
          break;
        }
        case 'oauth2': {
          const token = await storage.getItem(config.auth.tokenKey || 'access');
          if (!token && config.auth.oauth2) {
            // Fetch OAuth2 token if none exists
            const oauthResponse = await fetchOAuth2Token(config.auth.oauth2, storage);
            if (oauthResponse.access_token) {
              await storage.setItem(config.auth.tokenKey || 'access', oauthResponse.access_token);
              if (oauthResponse.refresh_token && config.auth.oauth2.refreshTokenKey) {
                await storage.setItem(config.auth.oauth2.refreshTokenKey, oauthResponse.refresh_token);
              }
              axiosConfig.headers.Authorization = `Bearer ${oauthResponse.access_token}`;
            }
          } else if (token) {
            axiosConfig.headers.Authorization = `Bearer ${token}`;
          } else {
            console.log('No OAuth2 token detected');
          }
          break;
        }
      }
      return axiosConfig;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && config.auth?.type === 'oauth2' && config.auth.oauth2) {
        // Attempt to refresh OAuth2 token
        const refreshToken = await storage.getItem(config.auth.oauth2.refreshTokenKey || 'refresh_token');
        if (refreshToken) {
          try {
            const oauthResponse = await fetchOAuth2Token(
              { ...config.auth.oauth2, grantType: 'refresh_token', refreshToken },
              storage
            );
            if (oauthResponse.access_token) {
              await storage.setItem(config.auth.tokenKey || 'access', oauthResponse.access_token);
              if (oauthResponse.refresh_token && config.auth.oauth2.refreshTokenKey) {
                await storage.setItem(config.auth.oauth2.refreshTokenKey, oauthResponse.refresh_token);
              }
              // Retry the original request
              error.config.headers.Authorization = `Bearer ${oauthResponse.access_token}`;
              return api(error.config);
            }
          } catch (refreshError) {
            console.error('Failed to refresh OAuth2 token:', refreshError);
            await storage.removeItem(config.auth.tokenKey || 'access');
            if (config.auth.oauth2.refreshTokenKey) {
              await storage.removeItem(config.auth.oauth2.refreshTokenKey);
            }
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}

// Helper function to fetch OAuth2 token
async function fetchOAuth2Token(oauthConfig: AuthConfig['oauth2'] & { refreshToken?: string }, storage: Storage) {
  const { tokenUrl, clientId, clientSecret, grantType = 'client_credentials', scope, refreshToken } = oauthConfig;
  const params = new URLSearchParams();
  params.append('grant_type', grantType);
  if (grantType === 'client_credentials') {
    params.append('client_id', clientId);
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }
    if (scope) {
      params.append('scope', scope);
    }
  } else if (grantType === 'refresh_token' && refreshToken) {
    params.append('refresh_token', refreshToken);
    params.append('client_id', clientId);
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }
  }

  const response = await axios.post(tokenUrl, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

// Default instance
export default createApiClient();