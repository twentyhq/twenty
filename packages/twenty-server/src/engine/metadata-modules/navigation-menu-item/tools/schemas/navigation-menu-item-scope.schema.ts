import { z } from 'zod';

export const navigationMenuItemScopeSchema = z
  .enum(['workspace', 'user'])
  .describe(
    "'user' creates a personal favorite, visible only to the current user. " +
      "'workspace' creates a shared navigation menu item visible to everyone (requires the LAYOUTS permission). " +
      'Twenty has no separate Favorites concept — favorites are just navigation menu items with scope=user.',
  );
