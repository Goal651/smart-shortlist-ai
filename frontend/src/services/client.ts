import axios, { AxiosInstance, AxiosResponse, AxiosProgressEvent, CancelToken } from 'axios';
import { API_CONFIG, HTTP_STATUS } from './constant';
import { ApiResponse } from '@/types/api';

class ApiClient {
    private axiosInstance: AxiosInstance;

    private logoutListeners: (() => void)[] = [];
    private maxRefreshAttempts: number = 3;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: `${API_CONFIG.BASE_URL}/api${API_CONFIG.API_VERSION ? `/${API_CONFIG.API_VERSION}` : ''}`,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.axiosInstance.interceptors.request.use(
            async config => {
                try {
                    const token = this.getAuthToken();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                } catch (error) {
                    return Promise.reject(error);
                }
            },
            error => {
                return Promise.reject(error);
            }
        );

        // Response interceptor to handle errors
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            async error => {
                const originalRequest = error.config;
                // Initialize retry count per request
                if (!originalRequest._retryCount) {
                    originalRequest._retryCount = 0;
                }

                try {
                    if (error.response) {
                        const status = error.response.status;

                        if (status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN) {
                            this.logout();
                            throw error;
                        }

                        // Retry only server-side errors (5xx)
                        if (
                            status >= 500 &&
                            status < 600 &&
                            originalRequest._retryCount < this.maxRefreshAttempts
                        ) {
                            originalRequest._retryCount++;
                            const delay = 1000 * originalRequest._retryCount; // 1s, 2s, 3s backoff
                            await new Promise(res => setTimeout(res, delay));
                            return this.axiosInstance(originalRequest);
                        }

                        throw error;
                    }

                    // Handle network or timeout errors
                    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
                        if (originalRequest._retryCount < this.maxRefreshAttempts) {
                            originalRequest._retryCount++;
                            const delay = 1000 * originalRequest._retryCount;
                            await new Promise(res => setTimeout(res, delay));
                            return this.axiosInstance(originalRequest);
                        }
                        throw new Error('Network error after multiple retries');
                    }

                    throw error;
                } catch (err) {
                    return Promise.reject(err);
                }
            }
        );
    }

    private getAuthToken() {
        try {
            return localStorage.getItem('auth_token');
        } catch {
            this.logout();
            return null;
        }
    }


    public async logout() {
        try {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.clear();
        } catch {
        } finally {
            this.logoutListeners.forEach(callback => {
                try {
                    callback();
                } catch { }
            });
        }
    }

    public onLogout(callback: () => void) {
        try {
            this.logoutListeners.push(callback);
        } catch { }
    }

    public removeLogoutListener(callback: () => void) {
        try {
            this.logoutListeners = this.logoutListeners.filter(cb => cb !== callback);
        } catch { }
    }

    async get<T>(endpoint: string, params?: Record<string, unknown>, options?: { timeout?: number }): Promise<ApiResponse<T>> {
        const response = await this.axiosInstance.get<T>(endpoint, {
            params,
            timeout: options?.timeout
        });
        return {
            success: true,
            data: response.data,
            message: 'Request successful'
        };
    }

    async post<T>(endpoint: string, data?: unknown, options?: { timeout?: number }): Promise<ApiResponse<T>> {
        const response = await this.axiosInstance.post<T>(endpoint, data, {
            timeout: options?.timeout
        });
        return {
            success: true,
            data: response.data,
            message: 'Request successful'
        };
    }

    async postFormData<T>(endpoint: string, formData: FormData, options?: { timeout?: number }): Promise<ApiResponse<T>> {
        const response = await this.axiosInstance.post<T>(endpoint, formData, {
            timeout: options?.timeout,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return {
            success: true,
            data: response.data,
            message: 'Request successful'
        };
    }

    async put<T>(endpoint: string, data?: unknown, options?: { timeout?: number }): Promise<ApiResponse<T>> {
        const response = await this.axiosInstance.put<T>(endpoint, data, {
            timeout: options?.timeout
        });
        return {
            success: true,
            data: response.data,
            message: 'Request successful'
        };
    }

    async patch<T>(endpoint: string, data?: unknown, options?: { timeout?: number }): Promise<ApiResponse<T>> {
        const response = await this.axiosInstance.patch<T>(endpoint, data, {
            timeout: options?.timeout
        });
        return {
            success: true,
            data: response.data,
            message: 'Request successful'
        };
    }

    async delete<T>(endpoint: string, options?: { timeout?: number }): Promise<ApiResponse<T>> {
        const response = await this.axiosInstance.delete<T>(endpoint, {
            timeout: options?.timeout
        });
        return {
            success: true,
            data: response.data,
            message: 'Request successful'
        };
    }

    async uploadFile<T>(
        endpoint: string,
        file: File,
        onUploadProgress?: (event: AxiosProgressEvent) => void,
        cancelToken?: CancelToken,
        timeout?: number
    ): Promise<ApiResponse<T>> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await this.axiosInstance.post<T>(endpoint, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
            cancelToken,
            timeout: timeout
        });

        return {
            success: true,
            data: response.data,
            message: 'File uploaded successfully'
        };
    }

}

export const apiClient = new ApiClient();