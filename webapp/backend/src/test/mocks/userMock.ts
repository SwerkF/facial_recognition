import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

interface UserMock {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roles: string;
    isActive: boolean;
    emailVerifiedAt: Date | null;
    lastLoginAt: Date | null;
    twoFactorSecret: string | null;
    twoFactorEnabled: boolean;
}

export const userMock: UserMock[] = [
    {
        id: uuidv4(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        roles: JSON.stringify(['ROLE_USER']),
        isActive: true,
        emailVerifiedAt: null,
        lastLoginAt: null,
        twoFactorSecret: null,
        twoFactorEnabled: false,
    },
    {
        id: uuidv4(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        roles: JSON.stringify(['ROLE_USER']),
        isActive: true,
        emailVerifiedAt: null,
        lastLoginAt: null,
        twoFactorSecret: null,
        twoFactorEnabled: false,
    },
    {
        id: uuidv4(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        roles: JSON.stringify(['ROLE_USER']),
        isActive: true,
        emailVerifiedAt: null,
        lastLoginAt: null,
        twoFactorSecret: null,
        twoFactorEnabled: false,
    },
    {
        id: uuidv4(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        roles: JSON.stringify(['ROLE_USER']),
        isActive: true,
        emailVerifiedAt: null,
        lastLoginAt: null,
        twoFactorSecret: null,
        twoFactorEnabled: false,
    },
    {
        id: uuidv4(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        roles: JSON.stringify(['ROLE_USER']),
        isActive: true,
        emailVerifiedAt: null,
        lastLoginAt: null,
        twoFactorSecret: null,
        twoFactorEnabled: false,
    },
    {
        id: uuidv4(),
        email: 'admin@nexelis.com',
        password: 'admin',
        firstName: 'Admin',
        lastName: 'Nexelis',
        roles: JSON.stringify(['ROLE_ADMIN']),
        isActive: true,
        emailVerifiedAt: null,
        lastLoginAt: null,
        twoFactorSecret: null,
        twoFactorEnabled: false,
    },
];
