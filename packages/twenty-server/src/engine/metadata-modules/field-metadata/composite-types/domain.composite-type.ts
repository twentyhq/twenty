import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const domainCompositeType: CompositeType = {
  type: FieldMetadataType.DOMAIN,
  properties: [
    {
      name: 'primaryLink',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: true,
    },
    {
      name: 'secondaryLinks',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
      isArray: true,
    },
  ],
};

export type DomainMetadata = {
  primaryLink: string;
  secondaryLinks?: string[] | null;
};
