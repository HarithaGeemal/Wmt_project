import axios from 'axios';

const API_BASE_URL = 'http://admin-backend-env.eba-cdsq37zf.ap-south-1.elasticbeanstalk.com/api/v1';

export interface Category {
    id: string;
    name: string;
    imageUrl?: string;
    products: Product[];
}

export interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    description?: string;
}

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
        // Do not throw a red-screen LogBox for 401/404 auth checks
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

export const fetchCategories = async () => (await api.get('/categories')).data as Category[];
export const fetchCategory = async (id: string) => (await api.get(`/categories/${id}`)).data as Category;

// products
export const fetchProducts = async () => (await api.get('/products')).data as Product[];
export const fetchProductsByCategory = async (categoryId: string) => (await api.get(`/categories/${categoryId}/products`)).data as Product[];
export const fetchProductById = async (id: string) => (await api.get(`/products/${id}`)).data as Product;

// addresses
export interface Address {
    id: string;
    userId: string;
    type: string;
    name: string;
    mobile: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
    isDefault?: boolean;
}

export const signUp = async (data: { email: string, password: string, phone: string, confirmPassword: string }) => {
    const { confirmPassword, ...rest } = data;
    return (await api.post('/auth/sign-up', { ...rest, password_confirm: confirmPassword })).data;
};
export const login = async (data: { email: string, password: string }) => (await api.post('/auth/login', data)).data;
export const fetchMe = async () => (await api.get('/auth/me')).data;

export const fetchAddresses = async () => (await api.get('/addresses')).data as Address[];
export const createAddress = async (data: Omit<Address, 'id' | 'userId'>) => (await api.post('/addresses', data)).data as Address;
export const updateAddress = async (params: { id: string, data: Partial<Address> }) => (await api.put(`/addresses/${params.id}`, params.data)).data as Address;
export const deleteAddress = async (id: string) => (await api.delete(`/addresses/${id}`)).data;

// orders
export const fetchStripeConfig = async () => (await api.get('/orders/stripe-config')).data;
export const createStripePaymentIntent = async (data: { amount: number, currency?: string }) => (await api.post('/orders/stripe-intent', data)).data;
export const createOrder = async (data: any) => (await api.post('/orders', data)).data;
export const fetchMyOrders = async () => (await api.get('/orders')).data;

// feedbacks
export interface Feedback {
    id: string;
    userId: { id: string; name?: string; email?: string } | string;
    productId: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export const fetchProductFeedback = async (productId: string) => (await api.get(`/feedbacks/product/${productId}`)).data as Feedback[];
export const createFeedback = async (data: { productId: string; rating: number; comment?: string }) => (await api.post('/feedbacks', data)).data as Feedback;
export const updateFeedback = async (id: string, data: { rating?: number; comment?: string }) => (await api.put(`/feedbacks/${id}`, data)).data as Feedback;
export const deleteFeedback = async (id: string) => (await api.delete(`/feedbacks/${id}`)).data;

// driver delivery APIs
export const fetchAvailableOrders = async () => (await api.get('/driver/available')).data;
export const acceptDeliveryOrder = async (orderId: string) => (await api.put(`/driver/accept/${orderId}`)).data;
export const startDeliveryOrder = async (orderId: string) => (await api.put(`/driver/start/${orderId}`)).data;
export const fetchMyDeliveries = async () => (await api.get('/driver/my-deliveries')).data;
export const markOrderDelivered = async (orderId: string) => (await api.put(`/driver/complete/${orderId}`)).data;

