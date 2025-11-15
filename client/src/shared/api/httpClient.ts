import axios, { AxiosInstance, AxiosRequestConfig, CancelTokenSource } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_BASE_URL is not set. API calls will likely fail.');
}

export interface RequestConfig extends AxiosRequestConfig {
  cancelTokenSource?: CancelTokenSource;
}

export const createCancelTokenSource = () => axios.CancelToken.source();

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export const httpClient = {
  get: <T>(url: string, config?: RequestConfig) => instance.get<T>(url, config),
  post: <T>(url: string, data?: unknown, config?: RequestConfig) => instance.post<T>(url, data, config)
};


