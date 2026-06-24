import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconMail,
  IconUser,
} from '@tabler/icons-react';

import { type ColumnMapping } from '../types/column-mapping';

export const MAPPINGS: ColumnMapping[] = [
  { Icon: IconUser, example: 'Dario', field: 'Name', header: 'First Name' },
  {
    Icon: IconMail,
    example: 'dario@anthropic.com',
    field: 'Emails',
    header: 'Email',
  },
  {
    Icon: IconBuildingSkyscraper,
    example: 'Anthropic',
    field: 'Company',
    header: 'Company',
  },
  {
    Icon: IconBriefcase,
    example: 'CEO',
    field: 'Job Title',
    header: 'Job Title',
  },
];
