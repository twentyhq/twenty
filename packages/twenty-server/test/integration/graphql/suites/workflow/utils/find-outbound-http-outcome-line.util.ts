const OUTCOME_LINE_PREFIX = 'Outbound HTTP outcome:';

export const findOutboundHttpOutcomeLine = ({
  spy,
  containing,
}: {
  spy: jest.SpyInstance;
  containing: string;
}): string | undefined =>
  spy.mock.calls
    .map(([message]) => String(message))
    .find(
      (message) =>
        message.startsWith(OUTCOME_LINE_PREFIX) && message.includes(containing),
    );
