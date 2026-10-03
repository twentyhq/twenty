// A turn runs for minutes, so the sender's access is checked again as it goes, but
// the steps and parallel tool calls that land in one window share a single check
export const createTurnAuthorizer = <TAuthorization>({
  authorize,
  authorization,
  maxAgeMs,
}: {
  authorize: () => Promise<TAuthorization>;
  authorization: TAuthorization;
  maxAgeMs: number;
}): (() => Promise<TAuthorization>) => {
  let latestAuthorization: Promise<TAuthorization> =
    Promise.resolve(authorization);
  let checkedAt = Date.now();

  return () => {
    if (Date.now() - checkedAt >= maxAgeMs) {
      checkedAt = Date.now();
      latestAuthorization = authorize();
    }

    return latestAuthorization;
  };
};
