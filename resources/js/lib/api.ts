import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Attach token automatically from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach XSRF token from cookie (for CSRF protection on login)
    const xsrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='));
    if (xsrfCookie) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfCookie.split('=')[1]);
    }

    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

// Initialize CSRF cookie from Sanctum
async function initCsrf() {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
}

// --- Auth ---
export const authApi = {
    login: async (email: string, password: string) => {
        await initCsrf();
        const res = await api.post('/login', { email, password });
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('auth_user', JSON.stringify(res.data.user));
        return res.data;
    },

    logout: async () => {
        await api.post('/logout').catch(() => { });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    },

    getUser: () => {
        const stored = localStorage.getItem('auth_user');
        return stored ? JSON.parse(stored) : null;
    },

    fetchUser: async () => {
        const res = await api.get('/user');
        return res.data;
    },

    isAuthenticated: () => !!localStorage.getItem('auth_token'),
};

// --- Checklists ---
export const checklistApi = {
    getAll: async () => {
        const res = await api.get('/checklists');
        return res.data;
    },

    create: async (data: { title: string; type?: string; data?: any }) => {
        const res = await api.post('/checklists', data);
        return res.data;
    },

    update: async (id: string, data: Partial<{ title: string; type: string; data: any }>) => {
        const res = await api.put(`/checklists/${id}`, data);
        return res.data;
    },

    remove: async (id: string) => {
        await api.delete(`/checklists/${id}`);
    },
};

// --- Tasks ---
export const taskApi = {
    create: async (checklistId: string, data: { text: string; role?: string; completed?: boolean }) => {
        const res = await api.post(`/checklists/${checklistId}/tasks`, data);
        return res.data;
    },

    update: async (id: string, data: Partial<{ text: string; role: string; completed: boolean }>) => {
        const res = await api.put(`/tasks/${id}`, data);
        return res.data;
    },

    remove: async (id: string) => {
        await api.delete(`/tasks/${id}`);
    },
};

export default api;
