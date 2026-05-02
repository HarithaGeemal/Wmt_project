import axios from 'axios';

// Production backend URL (AWS Elastic Beanstalk).
// For local emulator testing, set EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api/v1 in .env
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://admin-backend-env.eba-cdsq37zf.ap-south-1.elasticbeanstalk.com/api/v1';

console.log('[apiClient] Using API_BASE_URL:', API_BASE_URL);

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error: any) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error: any) => {
        if (error.response && [401, 404].includes(error.response.status)) {
            console.warn(`API auth check failed: ${error.response.status}`);
        } else {
            console.error('API Response Error:', error.message);
        }
        return Promise.reject(error);
    }
);

let authInterceptorId: number | null = null;

export const setAuthToken = (token: string | null) => {
    if (authInterceptorId !== null) {
        api.interceptors.request.eject(authInterceptorId);
    }
    if (token) {
        authInterceptorId = api.interceptors.request.use((config) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
    } else {
        authInterceptorId = null;
    }
}

// category APIs

export const fetchCategories = async () => (await api.get('/categories')).data;
export const fetchCategory = async (id: string) => (await api.get(`/categories/${id}`)).data;

/**
 * Create a category with an optional image file.
 * Sends multipart/form-data so the image binary is included.
 */
export const createCategory = async (data: { name: string; imageUri?: string }) => {
    const formData = new FormData();
    formData.append('name', data.name);

    if (data.imageUri) {
        const filename = data.imageUri.split('/').pop() ?? 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
            uri: data.imageUri,
            name: filename,
            type: mimeType,
        } as any);
    }

    const response = await api.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const updateCategory = async (id: string, data: { name: string; imageUri?: string }) => {
    const formData = new FormData();
    formData.append('name', data.name);

    if (data.imageUri) {
        const filename = data.imageUri.split('/').pop() ?? 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
            uri: data.imageUri,
            name: filename,
            type: mimeType,
        } as any);
    }

    const response = await api.put(`/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteCategory = async (id: string) => (await api.delete(`/categories/${id}`)).data;

// product APIs

export const fetchProductsByCategory = async (categoryId: string) => (await api.get(`/categories/${categoryId}/products`)).data;
export const fetchProducts = async () => (await api.get('/products')).data;
export const fetchProductById = async (id: string) => (await api.get(`/products/${id}`)).data;

export const createProduct = async (data: { name: string, description: string, price: string, categoryId: string, imageUri?: string }) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('price', data.price.toString());
    formData.append('categoryId', data.categoryId);

    if (data.imageUri) {
        const filename = data.imageUri.split('/').pop() ?? 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
            uri: data.imageUri,
            name: filename,
            type: mimeType,
        } as any);
    }

    const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const updateProduct = async (id: string, data: { name: string, description: string, price: string, categoryId: string, imageUri?: string }) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('price', data.price.toString());
    formData.append('categoryId', data.categoryId);

    if (data.imageUri) {
        const filename = data.imageUri.split('/').pop() ?? 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
            uri: data.imageUri,
            name: filename,
            type: mimeType,
        } as any);
    }

    const response = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteProduct = async (id: string) => (await api.delete(`/products/${id}`)).data;

// order APIs
export const fetchAllOrders = async () => (await api.get('/orders/all')).data;
export const fetchUserOrders = async (userId: string) => (await api.get(`/orders/all?userId=${userId}`)).data;
export const updateOrderStatus = async (id: string, status: string) => (await api.put(`/orders/${id}/status`, { status })).data;

// auth APIs
export const signUp = async (data: { email: string, password: string, phone: string, confirmPassword: string }) => {
    const { confirmPassword, ...rest } = data;
    return (await api.post('/auth/sign-up', { ...rest, password_confirm: confirmPassword })).data;
};
export const login = async (data: { email: string, password: string }) => (await api.post('/auth/login', data)).data;
export const fetchMe = async () => (await api.get('/auth/me')).data;

// user APIs
export const fetchUsers = async () => (await api.get('/auth/users')).data;
export const updateUser = async (id: string, data: { role?: string, isActive?: boolean }) => (await api.put(`/auth/users/${id}`, data)).data;

// feedback APIs
export const fetchAllFeedback = async () => (await api.get('/feedbacks/all')).data;
