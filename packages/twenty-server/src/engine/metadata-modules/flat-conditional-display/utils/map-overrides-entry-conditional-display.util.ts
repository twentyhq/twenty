export const mapOverridesEntryConditionalDisplay = <
  TOverridesEntry extends { conditionalDisplay?: unknown },
  TMappedConditionalDisplay,
>({
  overridesEntry,
  mapConditionalDisplay,
}: {
  overridesEntry: TOverridesEntry;
  mapConditionalDisplay: (
    conditionalDisplay: Exclude<
      TOverridesEntry['conditionalDisplay'],
      undefined
    >,
  ) => TMappedConditionalDisplay;
}): Omit<TOverridesEntry, 'conditionalDisplay'> & {
  conditionalDisplay?: TMappedConditionalDisplay;
} => {
  const { conditionalDisplay, ...otherOverrides } = overridesEntry;

  if (conditionalDisplay === undefined) {
    return otherOverrides;
  }

  return {
    ...otherOverrides,
    conditionalDisplay: mapConditionalDisplay(
      conditionalDisplay as Exclude<
        TOverridesEntry['conditionalDisplay'],
        undefined
      >,
    ),
  };
};
