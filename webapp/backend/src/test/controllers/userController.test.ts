/// <reference types="jest" />

import prisma from '@/config/prisma';
import { userController } from '@/controllers';

import { userMock } from '../mocks/userMock';
import { fakeReply, fakeRequest } from '../prismaTestUtils';

beforeEach(async () => {
    // Nettoyer et préparer les données de test
    await prisma.user.deleteMany();
    await prisma.user.createMany({ 
        data: userMock.slice(0, 3).map(user => ({
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
            isActive: user.isActive,
        }))
    });
});

test('should get all users', async () => {
    // Reset mocks
    (fakeReply.send as jest.Mock).mockClear();
    
    await userController.getAllUsers(fakeRequest as any, fakeReply as any);

    expect(fakeReply.send).toHaveBeenCalled();
});
