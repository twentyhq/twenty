import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';
import { type ViewEntityLookupService } from 'src/engine/metadata-modules/view-permissions/services/view-entity-lookup.service';
import { type ViewChildEntityKind } from 'src/engine/metadata-modules/view-permissions/types/view-permissions.types';

type ViewPermissionGuardRequest = {
  userWorkspaceId?: string;
  workspace: { id: string };
  apiKey?: { id?: string };
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
};

type ViewPermissionGuardArgs = Record<string, unknown>;

const addStringToSet = (values: Set<string>, value: unknown) => {
  if (typeof value === 'string') {
    values.add(value);
  }
};

const addInputStringToSet = (
  values: Set<string>,
  input: unknown,
  key: 'id' | 'viewId',
) => {
  if (
    typeof input === 'object' &&
    input !== null &&
    key in input &&
    typeof (input as Record<string, unknown>)[key] === 'string'
  ) {
    values.add((input as Record<string, string>)[key]);
  }
};

const addInputArrayStringsToSet = (
  values: Set<string>,
  inputs: unknown,
  key: 'id' | 'viewId',
) => {
  if (!Array.isArray(inputs)) {
    return;
  }

  for (const input of inputs) {
    addInputStringToSet(values, input, key);
  }
};

export const getViewPermissionGuardRequestAndArgs = (
  context: ExecutionContext,
) => {
  const gqlContext = GqlExecutionContext.create(context);

  return {
    request: gqlContext.getContext().req as ViewPermissionGuardRequest,
    args: gqlContext.getArgs() as ViewPermissionGuardArgs,
  };
};

export const extractViewIdsFromArgsAndRequest = ({
  args,
  request,
}: {
  args: ViewPermissionGuardArgs;
  request: ViewPermissionGuardRequest;
}) => {
  const viewIds = new Set<string>();

  addInputStringToSet(viewIds, args.input, 'viewId');
  addInputArrayStringsToSet(viewIds, args.inputs, 'viewId');
  addStringToSet(viewIds, request.body?.viewId);
  addInputStringToSet(viewIds, request.body?.input, 'viewId');
  addInputArrayStringsToSet(viewIds, request.body?.inputs, 'viewId');

  return [...viewIds];
};

export const extractEntityIdsFromArgsAndRequest = ({
  args,
  request,
}: {
  args: ViewPermissionGuardArgs;
  request: ViewPermissionGuardRequest;
}) => {
  const entityIds = new Set<string>();

  addStringToSet(entityIds, args.id);
  addInputStringToSet(entityIds, args.input, 'id');
  addInputArrayStringsToSet(entityIds, args.inputs, 'id');
  addStringToSet(entityIds, request.params?.id);
  addStringToSet(entityIds, request.body?.id);
  addInputStringToSet(entityIds, request.body?.input, 'id');
  addInputArrayStringsToSet(entityIds, request.body?.inputs, 'id');

  return [...entityIds];
};

export const authorizeViewIdsByChildEntity = async ({
  viewAccessService,
  viewIds,
  request,
}: {
  viewAccessService: ViewAccessService;
  viewIds: string[];
  request: ViewPermissionGuardRequest;
}) => {
  if (viewIds.length === 0) {
    return viewAccessService.canUserModifyViewByChildEntity(
      null,
      request.userWorkspaceId,
      request.workspace.id,
      request.apiKey?.id,
    );
  }

  for (const viewId of viewIds) {
    await viewAccessService.canUserModifyViewByChildEntity(
      viewId,
      request.userWorkspaceId,
      request.workspace.id,
      request.apiKey?.id,
    );
  }

  return true;
};

export const authorizeEntityIdsByChildEntity = async ({
  viewAccessService,
  viewEntityLookupService,
  kind,
  entityIds,
  request,
}: {
  viewAccessService: ViewAccessService;
  viewEntityLookupService: ViewEntityLookupService;
  kind: ViewChildEntityKind;
  entityIds: string[];
  request: ViewPermissionGuardRequest;
}) => {
  if (entityIds.length === 0) {
    return viewAccessService.canUserModifyViewByChildEntity(
      null,
      request.userWorkspaceId,
      request.workspace.id,
      request.apiKey?.id,
    );
  }

  const viewIds = new Set<string | null>();

  for (const entityId of entityIds) {
    viewIds.add(
      await viewEntityLookupService.findViewIdByEntityIdAndKind(
        kind,
        entityId,
        request.workspace.id,
      ),
    );
  }

  for (const viewId of viewIds) {
    await viewAccessService.canUserModifyViewByChildEntity(
      viewId,
      request.userWorkspaceId,
      request.workspace.id,
      request.apiKey?.id,
    );
  }

  return true;
};
