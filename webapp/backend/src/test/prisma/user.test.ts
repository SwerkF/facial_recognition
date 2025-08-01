/// <reference types="jest" />

import prisma from '@/config/prisma';

import { faker } from '@faker-js/faker';
import 'module-alias/register';

import { userMock } from '../mocks/userMock';
import { disconnectPrisma } from '../prismaTestUtils';

afterAll(async () => {
    await disconnectPrisma();
});

test('create user', async () => {
    const email = faker.internet.email();

    const userData = {
        email,
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        roles: JSON.stringify(['ROLE_USER']),
    };
    
    const user = await prisma.user.create({ data: userData });

    expect(user.email).toBe(email);
});

test('create multiple users', async () => {
    const users = await prisma.user.createMany({ 
        data: userMock.map(user => ({
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
        }))
    });

    expect(users.count).toBe(userMock.length);
});
