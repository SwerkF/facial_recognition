import { api } from '@/api/interceptor';
import type { ApiResponse } from '@/types';

import type { BasicUserDto, GetAllUsersDto, UpdateUserDto } from '@shared/dto';

class UserService {
    private apiUrl = '/api/users';

    public async getAllUsers(params: GetAllUsersDto): Promise<ApiResponse<BasicUserDto[]>> {
        const queryParams = new URLSearchParams();
        if (params.page) {
            queryParams.append('page', params.page);
        }
        if (params.limit) {
            queryParams.append('limit', params.limit);
        }
        if (params.search) {
            queryParams.append('search', params.search);
        }
        return api.fetchRequest(`${this.apiUrl}?${queryParams.toString()}`, 'GET', null, true);
    }

    public async getUserById(userId: string): Promise<ApiResponse<BasicUserDto>> {
        return api.fetchRequest(`${this.apiUrl}/${userId}`, 'GET', null, true);
    }

    public async updateUser(
        userId: string,
        user: UpdateUserDto
    ): Promise<ApiResponse<BasicUserDto>> {
        return api.fetchRequest(`${this.apiUrl}/${userId}`, 'PATCH', user, true);
    }

    public async deleteUser(userId: string): Promise<ApiResponse<BasicUserDto>> {
        return api.fetchRequest(`${this.apiUrl}/${userId}`, 'DELETE', null, true);
    }
}

export const userService = new UserService();
