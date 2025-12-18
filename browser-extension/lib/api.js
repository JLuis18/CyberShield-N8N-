/**
 * CyberShield API Client for Browser Extension
 * Handles all communication with the CyberShield backend
 */

const API_CONFIG = {
    baseURL: 'https://tu-cyber-shield-apk.vercel.app', // Production URL
    endpoints: {
        scanURL: '/api/scanner/url',
        scanNetwork: '/api/scanner/network',
        login: '/api/auth/login'
    }
};

class CyberShieldAPI {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.token = null;
        this.loadToken();
    }

    async loadToken() {
        const result = await chrome.storage.local.get(['authToken']);
        this.token = result.authToken || null;
    }

    async setToken(token) {
        this.token = token;
        await chrome.storage.local.set({ authToken: token });
    }

    async clearToken() {
        this.token = null;
        await chrome.storage.local.remove('authToken');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    await this.clearToken();
                    throw new Error('Authentication required');
                }
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    /**
     * Scan a URL for threats
     */
    async scanURL(url) {
        try {
            const response = await this.request(API_CONFIG.endpoints.scanURL, {
                method: 'POST',
                body: JSON.stringify({ url, fullAnalysis: true })
            });
            return response;
        } catch (error) {
            console.error('URL scan failed:', error);
            return {
                analyzed: false,
                error: error.message,
                riskLevel: 'unknown'
            };
        }
    }

    /**
     * Scan an IP:Port connection
     */
    async scanNetwork(ipAddress, port = 80) {
        try {
            const response = await this.request(API_CONFIG.endpoints.scanNetwork, {
                method: 'POST',
                body: JSON.stringify({ ipAddress, port, protocol: 'TCP' })
            });
            return response;
        } catch (error) {
            console.error('Network scan failed:', error);
            return {
                analyzed: false,
                error: error.message,
                riskLevel: 'unknown'
            };
        }
    }

    /**
     * Login to get authentication token
     */
    async login(email, password) {
        try {
            const response = await this.request(API_CONFIG.endpoints.login, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (response.token) {
                await this.setToken(response.token);
                return { success: true, token: response.token };
            }

            return { success: false, error: 'No token received' };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.token !== null;
    }

    /**
     * Update API base URL
     */
    async setBaseURL(url) {
        this.baseURL = url;
        await chrome.storage.local.set({ apiBaseURL: url });
    }

    /**
     * Get API base URL
     */
    async getBaseURL() {
        const result = await chrome.storage.local.get(['apiBaseURL']);
        return result.apiBaseURL || API_CONFIG.baseURL;
    }
}

// Singleton instance
const api = new CyberShieldAPI();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}
