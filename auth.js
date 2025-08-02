import bcrypt from 'bcrypt';
import { User } from './database.js';

// Register new user
export async function register(req, reply) {
  const { username, password, email, displayName } = req.body;
  
  // Validation
  if (!username || !password) {
    return reply.code(400).send({ error: 'Username and password are required' });
  }
  
  try {
    // Hash password for security
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user in database
    const user = await User.create({ 
      username, 
      password: hashedPassword, 
      email, 
      displayName: displayName || username 
    });
    
    console.log('✅ User registered:', user.username);
    
    reply.send({ 
      message: 'User registered successfully', 
      userId: user.id,
      username: user.username
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      reply.code(400).send({ error: 'Username already exists' });
    } else {
      reply.code(500).send({ error: 'Registration failed', details: error.message });
    }
  }
}

// Login user
export async function login(req, reply) {
  const { username, password } = req.body;
  
  // Validation
  if (!username || !password) {
    return reply.code(400).send({ error: 'Username and password are required' });
  }
  
  try {
    // Find user in database
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return reply.code(401).send({ error: 'Invalid username or password' });
    }
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return reply.code(401).send({ error: 'Invalid username or password' });
    }
    
    // Create JWT token
    const token = req.server.jwt.sign({ 
      id: user.id, 
      username: user.username, 
      displayName: user.displayName 
    });
    
    console.log('✅ Login successful:', username);
    
    reply.send({ 
      message: 'Login successful',
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        displayName: user.displayName 
      } 
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    reply.code(500).send({ error: 'Login failed' });
  }
}

// Get current user info (protected route)
export async function getCurrentUser(req, reply) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] } // Don't send password
    });
    
    reply.send({ user });
  } catch (error) {
    reply.code(500).send({ error: 'Failed to get user info' });
  }
}

// Authentication middleware
export async function authenticate(req, reply) {
  try {
    await req.jwtVerify();
  } catch (error) {
    reply.code(401).send({ error: 'Authentication required' });
  }
}
