import { api } from '@/api/interceptor';
import type { ApiResponse, AuthResponse, RefreshTokenRequest } from '@/types';

import type {
    AuthTokenDto,
    BasicUserDto,
    LoginSchema,
    RegisterDto,
    RequestPasswordResetDto,
    ResetPasswordDto,
    UpdatePasswordDto,
} from '@shared/dto';
import Cookies from 'js-cookie';

class AuthService {
    public async registerUser(user: RegisterDto): Promise<AuthResponse> {
        const response = await api.fetchRequest('/api/auth/register', 'POST', user);
        if (response.accessToken) {
            Cookies.set('accessToken', response.accessToken, { expires: 1 });
            Cookies.set('refreshToken', response.refreshToken, { expires: 30 });
        }
        return response;
    }

    public async loginUser(credentials: LoginSchema): Promise<AuthResponse> {
        const response = await api.fetchRequest('/api/auth/login', 'POST', credentials);
        if (response.accessToken) {
            Cookies.set('accessToken', response.accessToken, { expires: 1 });

            if (credentials.rememberMe) {
                Cookies.set('refreshToken', response.refreshToken, { expires: 30 });
            }
        }
        return response;
    }

    public async getUserByToken(accessToken: string): Promise<ApiResponse<BasicUserDto> | null> {
        if (!accessToken) {
            return null;
        }
        return api.fetchRequest('/api/auth/me', 'GET', null, true);
    }

    public async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const response = await api.fetchRequest('/api/auth/refresh_token', 'POST', {
            token: refreshToken,
        });
        if (response.accessToken) {
            Cookies.set('accessToken', response.accessToken, { expires: 1 });
            Cookies.set('refreshToken', response.refreshToken, { expires: 7 });
        }
        return response;
    }

    public async logout(refreshToken: string): Promise<ApiResponse<void>> {
        const request: RefreshTokenRequest = { token: refreshToken };
        return api.fetchRequest('/api/auth/logout', 'POST', request);
    }

    public async updatePassword(password: UpdatePasswordDto): Promise<ApiResponse<void>> {
        return api.fetchRequest('/api/auth/update-password', 'POST', password, true);
    }

    public async getSessions(userId: string): Promise<ApiResponse<AuthTokenDto[]>> {
        return api.fetchRequest(`/api/auth/sessions?userId=${userId}`, 'GET', null, true);
    }

    public async requestPasswordReset(data: RequestPasswordResetDto): Promise<ApiResponse<void>> {
        return api.fetchRequest('/api/auth/forgot-password', 'POST', data);
    }

    public async resetPassword(data: ResetPasswordDto): Promise<ApiResponse<void>> {
        return api.fetchRequest('/api/auth/reset-password', 'POST', data);
    }
}

export const authService = new AuthService();
