import { msg } from '@lingui/core/macro';
import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconMail,
  IconUser,
} from '@tabler/icons-react';

import { type ColumnMapping } from '../types/column-mapping';

export const MAPPINGS: ColumnMapping[] = [
  { Icon: IconUser, example: 'Dario', field: msg`Name`, header: 'First Name' },
  {
    Icon: IconMail,
    example: 'dario@anthropic.com',
    field: msg`Emails`,
    header: 'Email',
  },
  {
    Icon: IconBuildingSkyscraper,
    example: 'Anthropic',
    field: msg`Company`,
    header: 'Company',
  },
  {
    Icon: IconBriefcase,
    example: 'CEO',
    field: msg`Job Title`,
    header: 'Job Title',
  },
];
