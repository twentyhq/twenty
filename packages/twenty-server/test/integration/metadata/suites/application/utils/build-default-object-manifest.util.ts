import {
  getFieldUniversalIdentifier,
  type ObjectManifest,
} from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

// System fields (id, createdAt, …) are engine-provisioned and must not be
// manifest-authored: the sync rejects any reserved field name. The label
// identifier still defaults to the engine-derived id field universal
// identifier, which is resolvable without declaring the field.
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

  const idFieldUniversalIdentifier = getFieldUniversalIdentifier({
    applicationUniversalIdentifier,
    objectUniversalIdentifier,
    name: 'id',
  });

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
    fields: [...additionalFields],
  };
};
