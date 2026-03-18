import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const passwordHash = await bcrypt.hash(password, 12);
  return passwordHash;
}

export const verifyPassword = async (password: string, passwordHash: string): Promise<boolean> => {
  const compare = await bcrypt.compare(password, passwordHash);
  return compare;
}