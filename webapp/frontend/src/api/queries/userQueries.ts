import { userService } from '@/api/userService';

import type { BasicUserDto, GetAllUsersDto, UpdateUserDto } from '@shared/dto';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGetAllUsers = (searchParams: GetAllUsersDto) => {
    return useQuery<BasicUserDto[]>({
        queryKey: ['users', searchParams],
        queryFn: async () => {
            const response = await userService.getAllUsers(searchParams);
            return response.data;
        },
    });
};

export const useGetUserById = (userId: string) => {
    return useQuery<BasicUserDto>({
        queryKey: ['users', userId],
        queryFn: async () => {
            const response = await userService.getUserById(userId);
            return response.data;
        },
    });
};

export const useUpdateUser = () => {
    return useMutation<BasicUserDto, Error, { userId: string; user: UpdateUserDto }>({
        mutationFn: async ({ userId, user }: { userId: string; user: UpdateUserDto }) => {
            const response = await userService.updateUser(userId, user);
            return response.data;
        },
    });
};

export const useDeleteUser = () => {
    return useMutation<BasicUserDto, Error, string>({
        mutationFn: async (id: string) => {
            const response = await userService.deleteUser(id);
            return response.data;
        },
    });
};
