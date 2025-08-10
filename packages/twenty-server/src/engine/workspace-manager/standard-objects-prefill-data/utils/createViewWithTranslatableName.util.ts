import { type MessageDescriptor } from '@lingui/core';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';

// Extracts message from MessageDescriptor for view name
export const createViewWithTranslatableName = (
  name: MessageDescriptor,
  viewBuilder: (
    objectMetadataItems: ObjectMetadataEntity[],
  ) => Omit<ViewDefinition, 'name'>,
): ((objectMetadataItems: ObjectMetadataEntity[]) => ViewDefinition) => {
  return (objectMetadataItems: ObjectMetadataEntity[]): ViewDefinition => {
    const viewConfig = viewBuilder(objectMetadataItems);

    return {
      ...viewConfig,
      name: name?.message ?? '',
    };
  };
};
