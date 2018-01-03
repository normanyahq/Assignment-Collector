import { join } from 'path';

export const config = {
    port: 3000,
    allowedExtension: ['doc', 'docx'],
    tempPath: '/tmp',
    storagePath: join(__dirname, '..', 'files'),
    assignmentPath: join(__dirname, '..', 'files', 'assignments'),
    archievePath: join(__dirname, '..', 'files', 'archieve'),
    requestCooldown: 10000, //ms
    adminUsername: 'admin',
    adminPassword: 'hamlet',
    protectedRoutes: [
        { route: '/submissions', method: 'GET' },
        { route: '/download', method: 'GET' },
        { route: '/deadline', method: 'POST' },
        { route: '/archieve', method: 'POST' }
    ]
}