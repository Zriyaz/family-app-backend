import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    { id },
    secret,
    {
      expiresIn,
      issuer: 'family-app',
      audience: 'family-app-users',
    } as jwt.SignOptions
  );
};

