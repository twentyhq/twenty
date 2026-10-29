import { getCloudflareContext } from '@opennextjs/cloudflare';
import { isDefined } from 'twenty-shared/utils';

type TwentyConnectBinding = {
  fetch: (request: Request) => Promise<Response>;
};

const isTwentyConnectBinding = (
  value: unknown,
): value is TwentyConnectBinding =>
  isDefined(value) &&
  typeof (value as TwentyConnectBinding).fetch === 'function';

// Enterprise licensing moved to the twenty-connect Worker. Deployed servers
// keep calling twenty.com/api/enterprise, so these routes forward there; with
// forwarding off (rollback), the local handlers still answer.
export const forwardToTwentyConnect = async (
  request: Request,
): Promise<Response | null> => {
  if (process.env.TWENTY_CONNECT_FORWARDING_ENABLED !== 'true') {
    return null;
  }

  const { env } = await getCloudflareContext({ async: true });
  const binding = (env as { TWENTY_CONNECT?: unknown }).TWENTY_CONNECT;

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
