import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const linksCompositeType: CompositeType = {
  type: FieldMetadataType.LINKS,
  properties: [
    {
      name: 'primaryLinkLabel',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'primaryLinkUrl',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
      isIncludedInUniqueConstraint: true,
    },
    {
      name: 'secondaryLinks',
      type: FieldMetadataType.RAW_JSON,
      hidden: false,
      isRequired: false,
    },
  ],
};

export type LinksMetadata = {
  primaryLinkLabel: string;
  primaryLinkUrl: string;
  secondaryLinks: object | null;
};
