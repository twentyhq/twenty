export const filterPartsOfTurnActedByOthers = <TPart extends { type: string }>(
  parts: TPart[],
): TPart[] => parts.filter(({ type }) => type === 'text');
