import {
  IconBuildingFactory2,
  IconBuildingSkyscraper,
  IconLink,
  IconMapPin,
  IconMoneybag,
  IconTarget,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';

import { type ContactColumnId } from '../types/contact-column-id';

export const HEADER_ICONS: Record<ContactColumnId, typeof IconUser> = {
  company: IconBuildingSkyscraper,
  url: IconLink,
  createdBy: IconUserCircle,
  address: IconMapPin,
  accountOwner: IconUser,
  icp: IconTarget,
  arr: IconMoneybag,
  industry: IconBuildingFactory2,
};
