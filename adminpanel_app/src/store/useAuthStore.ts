import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, api } from '../api/apiClient';

export interface User {
    id: string;
    email: string;
    phone?: string;
    name?: string;
    role?: string;
}

type AuthState = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const validateAuth = async (logout: any, setAuth: any, token: string) => {
    try {
        const res = await api.get('/auth/me');
        setAuth(res.data.user, token);
    } catch (err) {
        logout();
    }
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => {
                setAuthToken(token);
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                setAuthToken(null);
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'admin-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state, error) => {
                if (!error && state?.token) {
                    setAuthToken(state.token);
                }
            }
        }
    )
);
