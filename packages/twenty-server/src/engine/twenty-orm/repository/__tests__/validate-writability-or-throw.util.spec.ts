import { MetadataWritability } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { validateWritabilityOrThrow } from 'src/engine/twenty-orm/repository/validate-writability-or-throw.util';

const OWNING_APPLICATION_ID = 'app-1';

const buildObjectMetadata = (writability: MetadataWritability) => ({
  nameSingular: 'slackUserLink',
  applicationId: OWNING_APPLICATION_ID,
  writability,
});

const buildFieldMetadataMaps = (
  writability: MetadataWritability,
): FlatEntityMaps<FlatFieldMetadata> => ({
  universalIdentifierById: { 'field-1': 'field-universal-1' },
  universalIdentifiersByApplicationId: {},
  byUniversalIdentifier: {
    'field-universal-1': {
      id: 'field-1',
      name: 'status',
      applicationId: OWNING_APPLICATION_ID,
      writability,
    } as FlatFieldMetadata,
  },
});

const applicationContext = {
  type: 'application',
  workspace: { id: 'workspace-1' },
  application: { id: OWNING_APPLICATION_ID },
} as WorkspaceAuthContext;

const otherApplicationContext = {
  type: 'application',
  workspace: { id: 'workspace-1' },
  application: { id: 'app-2' },
} as WorkspaceAuthContext;

const apiKeyContext = {
  type: 'apiKey',
  workspace: { id: 'workspace-1' },
  apiKey: { id: 'api-key-1' },
} as WorkspaceAuthContext;

const userContextCarryingApplication = {
  type: 'user',
  workspace: { id: 'workspace-1' },
  userWorkspaceId: 'user-workspace-1',
  user: { id: 'user-1' },
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' },
  application: { id: OWNING_APPLICATION_ID },
} as WorkspaceAuthContext;

const plainUserContext = {
  type: 'user',
  workspace: { id: 'workspace-1' },
  userWorkspaceId: 'user-workspace-1',
  user: { id: 'user-1' },
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' },
} as WorkspaceAuthContext;

const otherApplicationUserContext = {
  type: 'user',
  workspace: { id: 'workspace-1' },
  userWorkspaceId: 'user-workspace-1',
  user: { id: 'user-1' },
  workspaceMemberId: 'workspace-member-1',
  workspaceMember: { id: 'workspace-member-1' },
  application: { id: 'app-2' },
} as WorkspaceAuthContext;

const validate = ({
  objectWritability = MetadataWritability.OPEN,
  fieldWritability = MetadataWritability.OPEN,
  operationType = 'update',
  updatedColumns = ['status'],
  authContext,
}: {
  objectWritability?: MetadataWritability;
  fieldWritability?: MetadataWritability;
  operationType?: OperationType;
  updatedColumns?: string[];
  authContext: WorkspaceAuthContext | undefined;
}) =>
  validateWritabilityOrThrow({
    operationType,
    objectMetadata: buildObjectMetadata(objectWritability),
    updatedColumns,
    columnNameToFieldMetadataIdMap: { status: 'field-1' },
    flatFieldMetadataMaps: buildFieldMetadataMaps(fieldWritability),
    authContext,
  });

describe('validateWritabilityOrThrow', () => {
  it('should allow writes on OPEN metadata regardless of context', () => {
    expect(() => validate({ authContext: undefined })).not.toThrow();
  });

  it('should never restrict selects', () => {
    expect(() =>
      validate({
        objectWritability: MetadataWritability.SYSTEM,
        operationType: 'select',
        authContext: undefined,
      }),
    ).not.toThrow();
  });

  it('should let the owning application write an APPLICATION object', () => {
    expect(() =>
      validate({
        objectWritability: MetadataWritability.APPLICATION,
        authContext: applicationContext,
      }),
    ).not.toThrow();
  });

  it('should refuse another application on an APPLICATION object', () => {
    expect(() =>
      validate({
        objectWritability: MetadataWritability.APPLICATION,
        authContext: otherApplicationContext,
      }),
    ).toThrow(/not writable/);
  });

  it('should let the owning application write while serving a person', () => {
    expect(() =>
      validate({
        objectWritability: MetadataWritability.APPLICATION,
        authContext: userContextCarryingApplication,
      }),
    ).not.toThrow();
  });

  it('should refuse a plain session on an APPLICATION object', () => {
    expect(() =>
      validate({
        objectWritability: MetadataWritability.APPLICATION,
        authContext: plainUserContext,
      }),
    ).toThrow();
  });

  it('should refuse another application serving a person on an APPLICATION object', () => {
    expect(() =>
      validate({
        objectWritability: MetadataWritability.APPLICATION,
        authContext: otherApplicationUserContext,
      }),
    ).toThrow(/not writable/);
  });

  it('should refuse an api key context on an APPLICATION object', () => {
    expect(() =>
      validate({
        objectWritability: MetadataWritability.APPLICATION,
        authContext: apiKeyContext,
      }),
    ).toThrow(/not writable/);
  });

  it('should refuse a missing context on an APPLICATION object', () => {
    expect(() =>
      validate({
        objectWritability: MetadataWritability.APPLICATION,
        authContext: undefined,
      }),
    ).toThrow(/not writable/);
  });

  it('should refuse every caller on a SYSTEM object', () => {
    expect(() =>
      validate({
        objectWritability: MetadataWritability.SYSTEM,
        authContext: applicationContext,
      }),
    ).toThrow(/not writable/);
  });

  it('should enforce field writability even when the object is OPEN', () => {
    expect(() =>
      validate({
        fieldWritability: MetadataWritability.APPLICATION,
        authContext: plainUserContext,
      }),
    ).toThrow(/field "status".*not writable/);
  });

  it('should let the owning application write an APPLICATION field', () => {
    expect(() =>
      validate({
        fieldWritability: MetadataWritability.APPLICATION,
        authContext: applicationContext,
      }),
    ).not.toThrow();
  });

  it('should refuse every caller on a SYSTEM field', () => {
    expect(() =>
      validate({
        fieldWritability: MetadataWritability.SYSTEM,
        authContext: applicationContext,
      }),
    ).toThrow(/field "status".*not writable/);
  });

  it('should ignore field writability for columns that are not written', () => {
    expect(() =>
      validate({
        fieldWritability: MetadataWritability.SYSTEM,
        updatedColumns: [],
        authContext: undefined,
      }),
    ).not.toThrow();
  });
});
