import { type EnterpriseKeyPayload } from './organization-key-payload';
import { verifyJwt } from './verify-jwt';

export function verifyEnterpriseKey(
  token: string,
): EnterpriseKeyPayload | null {
  return verifyJwt<EnterpriseKeyPayload>(token);
}
