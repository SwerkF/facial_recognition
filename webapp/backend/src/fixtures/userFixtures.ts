import { faker } from '@faker-js/faker';

export const users = [
    {
        id: 'd2c89e50-1b27-4b6a-b8a6-8a3b5f85df50',
        email: 'admin@app.com',
        password: 'adminPassword',
        firstName: 'Admin',
        lastName: 'User',
        roles: "['ROLE_ADMIN']",
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-01T10:00:00Z'),
    },
    {
        id: 'bf0596a2-149e-42b7-94de-0a10774280eb',
        email: 'contact@app.com',
        password: 'adminPassword',
        firstName: 'Contact',
        lastName: 'App',
        roles: "['ROLE_USER']",
        createdAt: new Date('2023-01-02T10:00:00Z'),
        updatedAt: new Date('2023-01-02T10:00:00Z'),
    },
];

export const fakerUser = () => {
    return {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        password: 'userPassword',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        roles: "['ROLE_USER']",
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
    };
};
