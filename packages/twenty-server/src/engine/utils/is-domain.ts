export const isDomain = (url: string | undefined | null) =>
  !!url &&
  /^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.[a-z0-9-]{1,61}(\.[a-z]{2,})?$/.test(
    url,
  );
