import { registerEnumType } from '@nestjs/graphql';

import {
  NavigationMenuItemType,
  NavigationSystemPage,
} from 'twenty-shared/types';

registerEnumType(NavigationMenuItemType, {
  name: 'NavigationMenuItemType',
});

registerEnumType(NavigationSystemPage, {
  name: 'NavigationSystemPage',
});

export { NavigationMenuItemType, NavigationSystemPage };
