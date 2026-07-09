import {
  getFieldUniversalIdentifier,
  type ObjectManifest,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

// System field universal identifiers are server-owned and validated against
// the deterministic derivation, so the manifest must carry the derived values.
export const buildDefaultObjectManifest = ({
  nameSingular,
  namePlural,
  labelSingular,
  labelPlural,
  description,
  icon = 'IconTicket',
  additionalFields = [],
  universalIdentifier,
  labelIdentifierFieldMetadataUniversalIdentifier,
  applicationUniversalIdentifier,
}: {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
  additionalFields?: ObjectManifest['fields'];
  universalIdentifier?: string;
  labelIdentifierFieldMetadataUniversalIdentifier?: string;
  applicationUniversalIdentifier: string;
}): ObjectManifest => {
  const objectUniversalIdentifier = universalIdentifier ?? uuidv4();

  const computeSystemFieldUniversalIdentifier = (fieldName: string) =>
    getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier,
      name: fieldName,
    });

  const idFieldUniversalIdentifier =
    computeSystemFieldUniversalIdentifier('id');

  return {
    universalIdentifier: objectUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier:
      labelIdentifierFieldMetadataUniversalIdentifier ??
      idFieldUniversalIdentifier,
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
        universalIdentifier: computeSystemFieldUniversalIdentifier('createdAt'),
        type: FieldMetadataType.DATE_TIME,
        name: 'createdAt',
        label: 'Creation date',
      },
      {
        universalIdentifier: computeSystemFieldUniversalIdentifier('updatedAt'),
        type: FieldMetadataType.DATE_TIME,
        name: 'updatedAt',
        label: 'Last update',
      },
      {
        universalIdentifier: computeSystemFieldUniversalIdentifier('deletedAt'),
        type: FieldMetadataType.DATE_TIME,
        name: 'deletedAt',
        label: 'Deleted at',
      },
      {
        universalIdentifier: computeSystemFieldUniversalIdentifier('createdBy'),
        type: FieldMetadataType.ACTOR,
        name: 'createdBy',
        label: 'Created by',
      },
      {
        universalIdentifier: computeSystemFieldUniversalIdentifier('updatedBy'),
        type: FieldMetadataType.ACTOR,
        name: 'updatedBy',
        label: 'Updated by',
      },
      {
        universalIdentifier: computeSystemFieldUniversalIdentifier('position'),
        type: FieldMetadataType.POSITION,
        name: 'position',
        label: 'Position',
      },
      {
        universalIdentifier:
          computeSystemFieldUniversalIdentifier('searchVector'),
        type: FieldMetadataType.TS_VECTOR,
        name: 'searchVector',
        label: 'Search vector',
      },
      ...additionalFields,
    ],
  };
};
