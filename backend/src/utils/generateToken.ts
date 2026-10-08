import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};
