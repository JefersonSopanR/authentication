import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import formBody from '@fastify/formbody';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import path from 'path';
import { fileURLToPath } from 'url';

import { register, login, getCurrentUser, authenticate } from './auth.js';
import { initializeDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Fastify server
const app = fastify({ 
  logger: true 
});

// Register plugins
await app.register(cors, { origin: '*' });
await app.register(formBody);
await app.register(jwt, { secret: 'my-super-secret-key' });

// Serve static files (HTML, CSS, JS)
app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/'
});

// Authentication routes
app.post('/api/register', register);
app.post('/api/login', login);
app.get('/api/me', { preHandler: authenticate }, getCurrentUser);

// Root route
app.get('/', async (req, reply) => {
  return reply.sendFile('index.html');
});

// Start server
const start = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Start server
    await app.listen({ port: 3001, host: '0.0.0.0' });
    console.log('🚀 Auth Mini Server running on http://localhost:3001');
    console.log('📝 Register: http://localhost:3001');
    console.log('🔑 Login: Available after registration');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
