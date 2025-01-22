import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';

export const isTokenPresent = (request: Request): boolean => {
  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

  return !!token;
};
