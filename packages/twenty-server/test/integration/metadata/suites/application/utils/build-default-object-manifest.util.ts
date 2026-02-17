import { type ObjectManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

export const buildDefaultObjectManifest = ({
  nameSingular,
  namePlural,
  labelSingular,
  labelPlural,
  description,
  icon = 'IconTicket',
  additionalFields = [],
}: {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
  additionalFields?: ObjectManifest['fields'];
}): ObjectManifest => {
  const idFieldUniversalIdentifier = uuidv4();

  return {
    universalIdentifier: uuidv4(),
    labelIdentifierFieldMetadataUniversalIdentifier: idFieldUniversalIdentifier,
    nameSingular,
    namePlural,
    labelSingular,
    labelPlural,
    description,
    icon,
    fields: [
      {
        universalIdentifier: idFieldUniversalIdentifier,
        type: FieldMetadataType.UUID,
        name: 'id',
        label: 'Id',
      },
      {
        universalIdentifier: uuidv4(),
        type: FieldMetadataType.DATE_TIME,
        name: 'createdAt',
        label: 'Creation date',
      },
      {
        universalIdentifier: uuidv4(),
        type: FieldMetadataType.DATE_TIME,
        name: 'updatedAt',
        label: 'Last update',
      },
      {
        universalIdentifier: uuidv4(),
        type: FieldMetadataType.DATE_TIME,
        name: 'deletedAt',
        label: 'Deleted at',
      },
      {
        universalIdentifier: uuidv4(),
        type: FieldMetadataType.ACTOR,
        name: 'createdBy',
        label: 'Created by',
      },
      {
        universalIdentifier: uuidv4(),
        type: FieldMetadataType.ACTOR,
        name: 'updatedBy',
        label: 'Updated by',
      },
      {
        universalIdentifier: uuidv4(),
        type: FieldMetadataType.POSITION,
        name: 'position',
        label: 'Position',
      },
      {
        universalIdentifier: uuidv4(),
        type: FieldMetadataType.TS_VECTOR,
        name: 'searchVector',
        label: 'Search vector',
      },
      ...additionalFields,
    ],
  };
};
