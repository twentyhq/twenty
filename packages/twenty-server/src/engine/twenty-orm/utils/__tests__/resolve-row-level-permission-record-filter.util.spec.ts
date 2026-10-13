import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/resolve-row-level-permission-record-filter.util';

const OBJECT_ID = 'company-object';
const FIELD_ID = 'country-field';
const API_KEY_ID = 'api-key-1';
const API_KEY_ROLE_ID = 'api-key-role';
const AGENT_ROLE_ID = 'agent-role';
const APPLICATION_ROLE_ID = 'application-role';

const buildMaps = (
  entities: ({ id: string; universalIdentifier: string } & Record<
    string,
    unknown
  >)[],
) =>
  entities.reduce(
    (maps, entity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: entity as never,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps(),
  );

const buildCountryPredicate = (roleId: string, country: string) => ({
  id: `predicate-${roleId}`,
  universalIdentifier: `predicate-${roleId}`,
  roleId,
  objectMetadataId: OBJECT_ID,
  fieldMetadataId: FIELD_ID,
  operand: 'CONTAINS',
  value: country,
  subFieldName: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupId: null,
  positionInRowLevelPermissionPredicateGroup: null,
  deletedAt: null,
});

const objectMetadata = {
  id: OBJECT_ID,
  nameSingular: 'company',
  namePlural: 'companies',
  fieldIds: [FIELD_ID],
  fieldUniversalIdentifiers: [FIELD_ID],
} as unknown as FlatObjectMetadata;

const internalContext = {
  flatFieldMetadataMaps: buildMaps([
    {
      id: FIELD_ID,
      universalIdentifier: FIELD_ID,
      name: 'country',
      type: FieldMetadataType.TEXT,
      objectMetadataId: OBJECT_ID,
    },
  ]),
  flatRowLevelPermissionPredicateMaps: buildMaps([
    buildCountryPredicate(AGENT_ROLE_ID, 'France'),
    buildCountryPredicate(APPLICATION_ROLE_ID, 'Paris'),
  ]),
  flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
  userWorkspaceRoleMap: {},
  apiKeyRoleMap: { [API_KEY_ID]: API_KEY_ROLE_ID },
} as unknown as WorkspaceInternalContext;

const apiKeyAuthContext = {
  type: 'apiKey',
  workspace: { id: 'workspace-1' },
  apiKey: { id: API_KEY_ID },
} as unknown as WorkspaceAuthContext;

const resolve = (roleIds: string[]) =>
  resolveRowLevelPermissionRecordFilter({
    internalContext,
    authContext: apiKeyAuthContext,
    roleIds,
    objectMetadata,
  });

describe('resolveRowLevelPermissionRecordFilter', () => {
  it('applies the rules of every role the permissions intersect, not only the caller role', () => {
    expect(
      resolve([AGENT_ROLE_ID, API_KEY_ROLE_ID, APPLICATION_ROLE_ID]),
    ).toEqual({
      and: [
        { country: { ilike: '%France%' } },
        { country: { ilike: '%Paris%' } },
      ],
    });
  });

  it('restricts nothing when none of the roles has a rule', () => {
    expect(resolve([API_KEY_ROLE_ID])).toBeNull();
  });
});
