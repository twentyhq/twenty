import { PartialObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

export const computeStandardObject = (
  standardObjectMetadata: PartialObjectMetadata,
  originalObjectMetadata: ObjectMetadataEntity,
) => {
  return {
    ...standardObjectMetadata,
    fields: standardObjectMetadata.fields.map(
      ({ label, description, ...field }) => {
        const labelText =
          typeof label === 'function' ? label(originalObjectMetadata) : label;
        const descriptionText =
          typeof description === 'function'
            ? description(originalObjectMetadata)
            : description;

        return {
          ...field,
          label: labelText,
          description: descriptionText,
        };
      },
    ),
  };
};
