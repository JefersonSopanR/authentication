import { Sequelize, DataTypes } from 'sequelize';

// Create SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './users.sqlite',
  logging: false, // Set to console.log to see SQL queries
});

// User model - now supports local + OAuth users
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // ✅ can be null for Google accounts
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  provider: {
    type: DataTypes.STRING, // e.g. "local", "google"
    allowNull: false,
    defaultValue: 'local',
  },
  providerId: {
    type: DataTypes.STRING, // Google "sub" value
    allowNull: true,
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Initialize database
export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // ⚠️ Sync with alter so it adds missing columns without dropping data
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables created/updated');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export { User, sequelize };
