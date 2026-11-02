import { getCloudflareContext } from '@opennextjs/cloudflare';
import { isDefined } from 'twenty-shared/utils';

type TwentyConnectBinding = {
  fetch: (request: Request) => Promise<Response>;
};

const isTwentyConnectBinding = (
  value: unknown,
): value is TwentyConnectBinding =>
  isDefined(value) &&
  typeof value === 'object' &&
  'fetch' in value &&
  typeof value.fetch === 'function';

export const forwardToTwentyConnect = async (
  request: Request,
): Promise<Response | null> => {
  if (process.env.TWENTY_CONNECT_FORWARDING_ENABLED !== 'true') {
    return null;
  }

  let binding: unknown;

  try {
    const { env } = await getCloudflareContext({ async: true });

    binding = 'TWENTY_CONNECT' in env ? env.TWENTY_CONNECT : undefined;
  } catch (error) {
    console.error(
      '[enterprise] Cloudflare context is unavailable; answering locally',
      error,
    );

    return null;
  }

  if (!isTwentyConnectBinding(binding)) {
    console.error(
      '[enterprise] TWENTY_CONNECT_FORWARDING_ENABLED is set but the TWENTY_CONNECT binding is missing; answering locally',
    );

    return null;
  }

  const connectUrl = new URL(request.url);

  connectUrl.pathname = connectUrl.pathname.replace(
    /^\/api\/enterprise\//,
    '/v1/enterprise/',
  );

  return binding.fetch(new Request(connectUrl, request));
};
