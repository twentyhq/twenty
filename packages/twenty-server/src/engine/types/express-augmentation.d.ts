import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

declare module 'express-serve-static-core' {
  interface Request {
    impersonationContext?: AuthContext['impersonationContext'];
  }
}
