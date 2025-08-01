// src/stores/authStore.ts
import type { BasicUserDto } from '@shared/dto';
import { create } from 'zustand';

interface AuthState {
    user: BasicUserDto | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    setUser: (user: BasicUserDto | null) => void;
    setIsAuthenticated: (value: boolean) => void;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    setUser: (user) => set({ user }),
    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    login: (accessToken, refreshToken) =>
        set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
        }),
    logout: () =>
        set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
        }),
}));
