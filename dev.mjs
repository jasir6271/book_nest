import { spawn } from 'node:child_process';
import { createServer } from 'vite';

const api = spawn(process.execPath, ['server/server.js'], { stdio: 'inherit' });
const vite = await createServer();
await vite.listen();
vite.printUrls();
const shutdown = async () => { api.kill(); await vite.close(); process.exit(); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
api.on('error', error => { console.error('API failed to start:', error.message); shutdown(); });

api.on('exit', code => { if (code) { console.error('API stopped. Check MongoDB and .env configuration.'); shutdown(); } });
