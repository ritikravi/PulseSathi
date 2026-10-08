import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  return jwt.sign({ id }, secret, { expiresIn });
};
