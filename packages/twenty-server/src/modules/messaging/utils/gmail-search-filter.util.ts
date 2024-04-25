// export const gmailSearchFilterNonPersonalEmails =
//   '*noreply@|*no-reply@|*do_not_reply@|*no.reply@|*info@|*contact@|*hello@|*support@|*feedback@|*service@|*help@';

export const excludedCategories = ['promotions', 'social', 'forums'];

export const excludedLabelIds = excludedCategories.map(
  (category) => `CATEGORY_${category.toUpperCase()}`,
);

export const gmailSearchFilter = `-category:${excludedCategories.join(
  ' -category:',
)}`;
