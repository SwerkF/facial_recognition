import { forbiddenResponse, unauthorizedResponse } from '@/utils/jsonResponse';

import { User } from '@/config/client';
import { Role } from '@shared/enums';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

interface AuthenticatedRequest extends FastifyRequest {
    user: User;
}

/**
 * Middleware to check if the user has the required access rights, considering the role hierarchy.
 * @param requiredRole - The required role to access the resource.
 */
export const verifyAccess = (requiredRole: Role) => {
    return (req: AuthenticatedRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
        const { user } = req;

        if (!user) {
            return unauthorizedResponse(reply, 'Unauthorized: User not authenticated.');
        }

        const userRoles = user.roles ? JSON.parse(user.roles as string) : [];
        const hasAccess = userRoles.includes(requiredRole);

        if (hasAccess) {
            done();
        } else {
            return forbiddenResponse(reply, "Forbidden: You don't have the required permissions.");
        }
    };
};
