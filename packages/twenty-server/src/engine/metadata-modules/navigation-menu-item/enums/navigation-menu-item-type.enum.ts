import { registerEnumType } from '@nestjs/graphql';

import {
  NavigationMenuItemType,
  NavigationCorePage,
} from 'twenty-shared/types';

registerEnumType(NavigationMenuItemType, {
  name: 'NavigationMenuItemType',
});

registerEnumType(NavigationCorePage, {
  name: 'NavigationCorePage',
});

export { NavigationMenuItemType, NavigationCorePage };
