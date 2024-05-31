export const computeGmailCategoryExcludeSearchFilter = (
  excludedCategories: string[],
) => excludedCategories.map((category) => `-category:${category}`).join(' ');
