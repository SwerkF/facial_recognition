/// <reference types="jest" />

import buildApp from '@/index';

import 'module-alias/register';

import { userMock } from '../mocks/userMock';
import { disconnectPrisma } from '../prismaTestUtils';

afterAll(async () => {
    await disconnectPrisma();
});

test('should create a user', async () => {
    const app = await buildApp();

    const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        body: userMock[0],
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().message).toEqual('Utilisateur créé avec succès');
    
    await app.close();
});
