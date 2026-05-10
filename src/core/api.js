/**
 * src/core/api.js
 * Centralized API Service Layer for Project Kafka
 */
const BASE_URL = 'http://localhost:5000/api';

export const api = {
    // Helper for authenticated requests
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('kafka_auth_token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'API Error');
        return data;
    },

    // Auth Actions
    auth: {
        register: (hotelData) => api.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(hotelData)
        }),
        login: (credentials) => api.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        })
    }
};