export const isValidHostname = (
  url: string,
  options?: {
    allowLocalhost?: boolean;
    allowIp?: boolean;
  },
): boolean => {
  const allowIp = options?.allowIp ?? true;
  const allowLocalhost = options?.allowLocalhost ?? true;

  const regex =
    /^(((?!-))(xn--|_)?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.){1,10}(xn--)?([a-z0-9][a-z0-9-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$/;
  const isMatch = regex.test(url);
  const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(url);
  const isLocalhost = url === 'localhost' || url === '127.0.0.1';

  if (isLocalhost && !allowLocalhost) {
    return false;
  }

  if (isIp && !allowIp) {
    return false;
  }

  return isMatch || isLocalhost || isIp;
};
