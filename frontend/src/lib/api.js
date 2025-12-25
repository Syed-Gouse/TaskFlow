import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
    baseURL: API,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tasks API
export const tasksApi = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.category_id) params.append('category_id', filters.category_id);
        return api.get(`/tasks${params.toString() ? `?${params}` : ''}`);
    },
    getById: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
};

// Categories API
export const categoriesApi = {
    getAll: () => api.get('/categories'),
    create: (data) => api.post('/categories', data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Stats API
export const statsApi = {
    get: () => api.get('/stats'),
};

export default api;
