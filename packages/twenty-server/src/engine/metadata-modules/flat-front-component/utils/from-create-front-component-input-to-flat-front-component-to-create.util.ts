import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';

export const fromCreateFrontComponentInputToFlatFrontComponentToCreate = ({
  createFrontComponentInput,
  workspaceId,
  flatApplication,
}: {
  createFrontComponentInput: CreateFrontComponentInput;
  workspaceId: string;
  flatApplication: FlatApplication;
}): FlatFrontComponent => {
  const now = new Date().toISOString();

  const { name } = trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
    createFrontComponentInput,
    ['name'],
  );

  const id = createFrontComponentInput.id ?? v4();

  return {
    id,
    name,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    universalIdentifier: id,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
