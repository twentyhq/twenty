import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { buildUniqueMetadataName } from 'test/integration/sdk-client/utils/build-unique-metadata-name.util';
import { type Manifest } from 'twenty-shared/application';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

// An application's SDK client only covers standard objects, its own objects
// and the objects its relations point to: relating to an object created
// through the metadata API pulls that object into the generated client.
export const buildRelationToObjectManifest = ({
  applicationUniversalIdentifier,
  targetObjectUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  targetObjectUniversalIdentifier: string;
}): Pick<Manifest, 'objects' | 'fields'> => {
  const sourceObjectUniversalIdentifier = uuidv4();
  const nameFieldUniversalIdentifier = uuidv4();
  const targetFieldUniversalIdentifier = uuidv4();
  const sourcesFieldUniversalIdentifier = uuidv4();
  const nameSingular = buildUniqueMetadataName('sdkProbeSource');

  return {
    objects: [
      buildDefaultObjectManifest({
        applicationUniversalIdentifier,
        universalIdentifier: sourceObjectUniversalIdentifier,
        nameSingular,
        namePlural: `${nameSingular}s`,
        labelSingular: nameSingular,
        labelPlural: `${nameSingular}s`,
        labelIdentifierFieldMetadataUniversalIdentifier:
          nameFieldUniversalIdentifier,
        additionalFields: [
          {
            universalIdentifier: nameFieldUniversalIdentifier,
            type: FieldMetadataType.TEXT,
            name: 'name',
            label: 'Name',
          },
          {
            universalIdentifier: targetFieldUniversalIdentifier,
            type: FieldMetadataType.RELATION,
            name: 'target',
            label: 'Target',
            relationTargetFieldMetadataUniversalIdentifier:
              sourcesFieldUniversalIdentifier,
            relationTargetObjectMetadataUniversalIdentifier:
              targetObjectUniversalIdentifier,
            universalSettings: {
              relationType: RelationType.MANY_TO_ONE,
              joinColumnName: 'targetId',
              onDelete: RelationOnDeleteAction.SET_NULL,
            },
          },
        ],
      }),
    ],
    fields: [
      {
        universalIdentifier: sourcesFieldUniversalIdentifier,
        type: FieldMetadataType.RELATION,
        name: 'sdkProbeSources',
        label: 'SDK Probe Sources',
        objectUniversalIdentifier: targetObjectUniversalIdentifier,
        relationTargetFieldMetadataUniversalIdentifier:
          targetFieldUniversalIdentifier,
        relationTargetObjectMetadataUniversalIdentifier:
          sourceObjectUniversalIdentifier,
        universalSettings: { relationType: RelationType.ONE_TO_MANY },
      },
    ],
  };
};
