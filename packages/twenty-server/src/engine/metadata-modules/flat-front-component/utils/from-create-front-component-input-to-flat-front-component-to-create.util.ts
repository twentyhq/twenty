import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';
import { type UniversalFlatFrontComponent } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-front-component.type';

export const fromCreateFrontComponentInputToFlatFrontComponentToCreate = ({
  createFrontComponentInput,
  flatApplication,
}: {
  createFrontComponentInput: CreateFrontComponentInput;
  flatApplication: FlatApplication;
}): UniversalFlatFrontComponent => {
  const now = new Date().toISOString();

  const { name } = trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
    createFrontComponentInput,
    ['name'],
  );

  return {
    name: name ?? createFrontComponentInput.componentName,
    description: createFrontComponentInput.description ?? null,
    sourceComponentPath: createFrontComponentInput.sourceComponentPath,
    builtComponentPath: createFrontComponentInput.builtComponentPath,
    componentName: createFrontComponentInput.componentName,
    builtComponentChecksum: createFrontComponentInput.builtComponentChecksum,
    createdAt: now,
    updatedAt: now,
    universalIdentifier: v4(),
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
