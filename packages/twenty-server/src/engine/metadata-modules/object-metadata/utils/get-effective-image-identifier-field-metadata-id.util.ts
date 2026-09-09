import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/utils/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/utils/read-authored-override-property.util';

type ImageIdentifierResolvableObjectMetadata = {
  overrides?: unknown;
  imageIdentifierFieldMetadataId?: string | null;
  applicationUniversalIdentifier?: string;
};

export const getEffectiveImageIdentifierFieldMetadataId = (
  objectMetadata: ImageIdentifierResolvableObjectMetadata,
  authorContext?: OverrideAuthorReadContext,
): string | null => {
  const overrideValue = readAuthoredOverrideProperty({
    overrides: objectMetadata.overrides,
    path: ['imageIdentifierFieldMetadataId'],
    authorContext: authorContext ?? {
      ownerApplicationUniversalIdentifier:
        objectMetadata.applicationUniversalIdentifier,
    },
  });

  if (overrideValue !== undefined) {
    return (overrideValue as string | null) ?? null;
  }

  return objectMetadata.imageIdentifierFieldMetadataId ?? null;
};
