import { v4 as uuidV4 } from 'uuid';

import { type CreateRouteInput } from 'src/engine/metadata-modules/route/dtos/create-route.input';
import { type FlatRoute } from 'src/engine/metadata-modules/route/types/flat-route.type';

export const fromCreateRouteInputToFlatRoute = ({
  createRouteInput,
  workspaceId,
}: {
  createRouteInput: CreateRouteInput;
  workspaceId: string;
}): FlatRoute => {
  const now = new Date();

  return {
    id: uuidV4(),
    universalIdentifier: createRouteInput.universalIdentifier ?? uuidV4(),
    path: createRouteInput.path,
    isAuthRequired: createRouteInput.isAuthRequired,
    httpMethod: createRouteInput.httpMethod,
    serverlessFunctionId: createRouteInput.serverlessFunctionId,
    workspaceId,
    createdAt: now,
    updatedAt: now,
  };
};
