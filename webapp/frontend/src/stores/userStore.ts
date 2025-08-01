import { create } from 'zustand';

interface UserState {
    id: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl?: string;
    setUser: (user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        avatarUrl?: string;
    }) => void;
    clearUser: () => void;
}

export const useAuthStore = create<UserState>()((set) => ({
    id: null,
    email: null,
    firstName: null,
    lastName: null,
    phone: null,
    avatarUrl: undefined,
    setUser: (user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        avatarUrl?: string;
    }) =>
        set(() => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
        })),
    clearUser: () =>
        set(() => ({
            id: null,
            firstName: null,
            lastName: null,
            email: null,
            phone: null,
            avatarUrl: undefined,
        })),
}));
