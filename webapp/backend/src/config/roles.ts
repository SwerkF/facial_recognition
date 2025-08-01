import { Role } from '@shared/enums';

// Mapping of the hierarchy: each role inherits directly from the listed roles
export const roleHierarchy: { [key: string]: Role[] } = {
    [Role.USER]: [],
    [Role.ADMIN]: [Role.USER],
};

// Recursive function to check the transitive inheritance of roles
export function hasInheritedRole(currentRole: Role, requiredRole: Role): boolean {
    if (currentRole === requiredRole) {
        return true;
    }
    if (!roleHierarchy[currentRole]) {
        return false;
    }
    for (const inheritedRole of roleHierarchy[currentRole]) {
        if (hasInheritedRole(inheritedRole, requiredRole)) {
            return true;
        }
    }
    return false;
}
