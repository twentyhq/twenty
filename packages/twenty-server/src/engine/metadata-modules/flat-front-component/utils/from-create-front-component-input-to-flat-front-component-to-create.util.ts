import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';

const DEFAULT_SOURCE_COMPONENT_PATH = 'src/front-components/index.tsx';
const DEFAULT_BUILT_COMPONENT_PATH = 'src/front-components/index.mjs';
const DEFAULT_COMPONENT_NAME = 'default';

export const fromCreateFrontComponentInputToFlatFrontComponentToCreate = ({
  createFrontComponentInput,
  workspaceId,
  applicationId,
}: {
  createFrontComponentInput: CreateFrontComponentInput;
  workspaceId: string;
  applicationId: string;
}): FlatFrontComponent => {
  const now = new Date().toISOString();

  const { name } = trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
    createFrontComponentInput,
    ['name'],
  );

  const id = createFrontComponentInput.id ?? v4();
  const universalIdentifier =
    createFrontComponentInput.universalIdentifier ?? v4();

  return {
    id,
    name,
    description: createFrontComponentInput.description ?? null,
    sourceComponentPath:
      createFrontComponentInput.sourceComponentPath ??
      DEFAULT_SOURCE_COMPONENT_PATH,
    builtComponentPath:
      createFrontComponentInput.builtComponentPath ??
      DEFAULT_BUILT_COMPONENT_PATH,
    componentName:
      createFrontComponentInput.componentName ?? DEFAULT_COMPONENT_NAME,
    checksum: createFrontComponentInput.checksum ?? null,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    universalIdentifier,
    applicationId,
  };
};
