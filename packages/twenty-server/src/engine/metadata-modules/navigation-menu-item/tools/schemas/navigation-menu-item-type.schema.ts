import { NavigationMenuItemType } from 'twenty-shared/types';
import { z } from 'zod';

export const navigationMenuItemTypeSchema = z.enum([
  NavigationMenuItemType.FOLDER,
  NavigationMenuItemType.LINK,
  NavigationMenuItemType.OBJECT,
  NavigationMenuItemType.VIEW,
  NavigationMenuItemType.RECORD,
  NavigationMenuItemType.PAGE_LAYOUT,
]);
