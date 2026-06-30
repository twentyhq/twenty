import 'server-only';

import { type I18n } from '@lingui/core';
import { getI18n } from '@lingui/react/server';

// Reads the request-scoped server i18n for descendant server components. The
// source-locale fallback is purely defensive — every route registers a
// context via getRouteI18n.
export const getServerI18n = (): I18n => {
  const instance = getI18n() as I18n | null;
  if (instance) return instance;
  // No silent fallback: a module-global instance would race under
  // concurrent requests and bleed locales across them.
  throw new Error(
    'getServerI18n() called outside a request-scoped i18n context. Call ' +
      'getRouteI18n(params) in the route before rendering this component.',
  );
};
