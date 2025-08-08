import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const COMPANY_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'tagline',
    label: 'Tagline',
    description: "Company's Tagline",
    icon: 'IconAdCircle',
    isActive: true,
    isNullable: false,
    isUnique: false,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'introVideo',
    label: 'Intro Video',
    description: "Company's Intro Video",
    icon: 'IconVideo',
    isActive: true,
    isNullable: true,
    isUnique: false,
  },
  {
    type: FieldMetadataType.MULTI_SELECT,
    name: 'workPolicy',
    label: 'Work Policy',
    description: "Company's Work Policy",
    icon: 'IconHome',
    isActive: true,
    isNullable: true,
    isUnique: false,
    options: [
      {
        color: 'green',
        label: 'On-Site',
        position: 0,
        value: 'ON_SITE',
      },
      {
        color: 'turquoise',
        label: 'Hybrid',
        position: 1,
        value: 'HYBRID',
      },
      {
        color: 'sky',
        label: 'Remote Work',
        position: 2,
        value: 'REMOTE_WORK',
      },
    ],
  },
  {
    type: FieldMetadataType.BOOLEAN,
    name: 'visaSponsorship',
    label: 'Visa Sponsorship',
    description: "Company's Visa Sponsorship Policy",
    icon: 'IconBrandVisa',
    isActive: true,
    isNullable: true,
    isUnique: false,
    defaultValue: false,
  },
];
