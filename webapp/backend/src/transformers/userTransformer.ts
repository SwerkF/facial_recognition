import { UserWithRelations } from '@/types';

import { BasicUserDto } from '@shared/dto';
import { Role } from '@shared/enums';

class UserTransformer {
    public toUserDto(user: UserWithRelations): BasicUserDto {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            roles: Array.isArray(user.roles) ? (user.roles as Role[]) : ([user.roles] as Role[]),
        };
    }
}

export const userTransformer = new UserTransformer();
