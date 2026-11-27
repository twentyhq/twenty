import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';

export const extractSessionCookie = (
  setCookieHeader: string | string[] | undefined,
): string | undefined => {
  const setCookies =
    typeof setCookieHeader === 'string'
      ? [setCookieHeader]
      : (setCookieHeader ?? []);

  return setCookies
    .find((cookie) => cookie.startsWith(`${USER_SESSION_COOKIE_NAME}=`))
    ?.split(';')[0];
};
