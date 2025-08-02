import { Sequelize, DataTypes } from 'sequelize';

// Create SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './users.sqlite',
  logging: false // Set to console.log to see SQL queries
});

// User model - only essential fields for auth
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Initialize database
export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    await sequelize.sync();
    console.log('✅ Database tables created');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export { User, sequelize };
