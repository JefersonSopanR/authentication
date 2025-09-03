import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import formBody from '@fastify/formbody';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import path from 'path';
import { fileURLToPath } from 'url';

//Oauth2.0
import oauthPlugin from '@fastify/oauth2';
import { request } from 'undici';//is used to request information (the user's profile data) from Google after the user authenticates with Google OAuth2.
import 'dotenv/config';//by default loads environment variables from a file named .env

import { register, login, getCurrentUser, authenticate } from './auth.js';
import { initializeDatabase, User } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Fastify server
const app = fastify({ logger: true });

// Register plugins
await app.register(cors, { origin: '*' });
await app.register(formBody);
await app.register(jwt, { secret: process.env.JWT_SECRET || 'my-super-secret-key' });

// Serve static files (HTML, CSS, JS)
app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/'
});

// Local authentication routes
app.post('/api/register', register);
app.post('/api/login', login);
app.get('/api/me', { preHandler: authenticate }, getCurrentUser);

// Google OAuth2 setup
await app.register(oauthPlugin, {
  name: 'googleOAuth2',
  scope: ['openid', 'email', 'profile'],
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
    },
    auth: oauthPlugin.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: '/auth/google',
  callbackUri: 'http://localhost:3001/auth/google/callback',
});

// Google OAuth2 callback
app.get('/auth/google/callback', async (req, reply) => {
  const tokenResponse = await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
  const accessToken = tokenResponse.token.access_token;

  // Fetch user profile from Google
  const { body } = await request('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = await body.json();

  // Find or create user in DB
  let user = await User.findOne({ where: { provider: 'google', providerId: profile.sub } });
  if (!user) {
    user = await User.create({
      username: profile.email,
      email: profile.email,
      displayName: profile.name,
      provider: 'google',
      providerId: profile.sub,
      avatarUrl: profile.picture,
      emailVerified: profile.email_verified,
      password: '', // no password for Google accounts
    });
  }

  // Issue your own JWT
  const myJwt = app.jwt.sign(
    { id: user.id, username: user.username, displayName: user.displayName },
    { expiresIn: '7d' }
  );

  // Redirect back to frontend with JWT in URL fragment
  return reply.redirect(`http://localhost:3001/#token=${myJwt}`);
});

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
    console.log('📝 Register: http://localhost:3001/api/register');
    console.log('🔑 Login: http://localhost:3001/api/login');
    console.log('🔑 Google Login: http://localhost:3001/auth/google');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
