// PROTOTYPE (?direction=e): the pastel set Jocelyn picked for categorical
// data (#B9A7F8 lavender, #E799F1 orchid, #4FD8BF teal, #7CC3E9 sky,
// #F795B0 rose), written in oklch until they move into src/tokens.
const APPS_STAGE_PASTELS: readonly string[] = [
  'oklch(77.4% 0.115 293.7)',
  'oklch(79% 0.146 322.8)',
  'oklch(80.1% 0.123 178.6)',
  'oklch(78.4% 0.09 232.9)',
  'oklch(77.8% 0.121 2.5)',
];

// Categories take colours in alphabetical order, so a category keeps its hue
// whatever the filter shows.
export const getAppsStagePastel = (
  category: string,
  sortedCategories: readonly string[],
): string => {
  const position = sortedCategories.indexOf(category);

  return APPS_STAGE_PASTELS[
    (position < 0 ? 0 : position) % APPS_STAGE_PASTELS.length
  ];
};
