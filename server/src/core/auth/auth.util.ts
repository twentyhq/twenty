import * as bcrypt from 'bcrypt';

export const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const saltRounds = 10;

export const hashPassword = async (password: string) => {
  const hash = await bcrypt.hash(password, saltRounds);

  return hash;
};

export const compareHash = async (password: string, passwordHash: string) => {
  return bcrypt.compare(password, passwordHash);
};
