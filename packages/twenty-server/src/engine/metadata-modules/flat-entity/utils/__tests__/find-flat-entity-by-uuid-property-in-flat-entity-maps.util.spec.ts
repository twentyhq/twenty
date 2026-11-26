import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUuidPropertyInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-uuid-property-in-flat-entity-maps.util';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const flatWorkflow: FlatWorkflow = {
  id: '20202020-0000-4000-8000-000000000001',
  universalIdentifier: '20202020-0000-4000-8000-000000000002',
  workspaceId: '20202020-0000-4000-8000-000000000003',
  applicationId: '20202020-0000-4000-8000-000000000004',
  applicationUniversalIdentifier: '20202020-0000-4000-8000-000000000005',
  name: 'Onboarding',
  versionDefinitionHash: null,
  lastPublishedCoreWorkflowVersionId: null,
  workspaceWorkflowId: '0d4fcb0b-6b6c-4f3a-9a8e-1f2f3c4d5e6f',
  isSystem: false,
  isPrivate: false,
  createdByUserWorkspaceId: null,
  navigationMenuItemIds: [],
  navigationMenuItemUniversalIdentifiers: [],
  createdAt: '2026-11-12T00:00:00.000Z',
  updatedAt: '2026-11-12T00:00:00.000Z',
};

const flatWorkflowMaps: FlatEntityMaps<FlatWorkflow> =
  createEmptyFlatEntityMaps();

addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
  flatEntity: flatWorkflow,
  flatEntityMapsToMutate: flatWorkflowMaps,
});

describe('findFlatEntityByUuidPropertyInFlatEntityMaps', () => {
  it('should find a flat entity by a uuid property', () => {
    expect(
      findFlatEntityByUuidPropertyInFlatEntityMaps({
        flatEntityMaps: flatWorkflowMaps,
        propertyName: 'workspaceWorkflowId',
        uuid: '0d4fcb0b-6b6c-4f3a-9a8e-1f2f3c4d5e6f',
      }),
    ).toBe(flatWorkflow);
  });

  it('should find a flat entity by an uppercased uuid', () => {
    expect(
      findFlatEntityByUuidPropertyInFlatEntityMaps({
        flatEntityMaps: flatWorkflowMaps,
        propertyName: 'workspaceWorkflowId',
        uuid: '0D4FCB0B-6B6C-4F3A-9A8E-1F2F3C4D5E6F',
      }),
    ).toBe(flatWorkflow);
  });

  it('should return undefined when no flat entity matches', () => {
    expect(
      findFlatEntityByUuidPropertyInFlatEntityMaps({
        flatEntityMaps: flatWorkflowMaps,
        propertyName: 'workspaceWorkflowId',
        uuid: '11111111-1111-4111-8111-111111111111',
      }),
    ).toBeUndefined();
  });
});
