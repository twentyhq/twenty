import { type EnterpriseKeyPayload } from './enterprise-key-payload';
import { signJwt } from './sign-jwt';

export function signEnterpriseKey(
  subscriptionId: string,
  licensee: string,
): string {
  const payload: EnterpriseKeyPayload = {
    iat: Math.floor(Date.now() / 1000),
    licensee,
    sub: subscriptionId,
  };

  return signJwt(payload);
}
