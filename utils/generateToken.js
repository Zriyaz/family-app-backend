import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d', // Default to 7 days instead of 30
    issuer: 'family-app',
    audience: 'family-app-users',
  });
};

