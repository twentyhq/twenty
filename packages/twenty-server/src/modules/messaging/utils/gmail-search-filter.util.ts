export const excludedCategories = ['promotions', 'social', 'forums'];

export const excludedLabelIds = excludedCategories.map(
  (category) => `CATEGORY_${category.toUpperCase()}`,
);

export const gmailSearchFilter = `-category:${excludedCategories.join(
  ' -category:',
)}`;
