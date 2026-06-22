import { type EnterpriseKeyPayload } from './enterprise-key-payload';
import { verifyJwt } from './verify-jwt';

export function verifyEnterpriseKey(
  token: string,
): EnterpriseKeyPayload | null {
  return verifyJwt<EnterpriseKeyPayload>(token);
}
