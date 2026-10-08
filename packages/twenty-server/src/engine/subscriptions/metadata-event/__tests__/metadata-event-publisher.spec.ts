import { Test, type TestingModule } from '@nestjs/testing';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { NavigationMenuItemRecordIdentifierService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-record-identifier.service';
import { getMorphRelationGroupFlatEntityMapsMock } from 'src/engine/subscriptions/metadata-event/__mocks__/get-morph-relation-group-flat-entity-maps.mock';
import { MetadataEventPublisher } from 'src/engine/subscriptions/metadata-event/metadata-event-publisher';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

const OWNER_USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

describe('MetadataEventPublisher', () => {
  let publisher: MetadataEventPublisher;
  const broadcast = jest.fn();
  const getOrRecomputeManyOrAllFlatEntityMaps = jest.fn();
  const getApplicationAuthorIdentifiers = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    getApplicationAuthorIdentifiers.mockResolvedValue({
      standardApplicationId: 'standard-application-id',
      workspaceCustomApplicationUniversalIdentifier: 'custom-application',
      universalIdentifierByApplicationId: {},
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetadataEventPublisher,
        { provide: WorkspaceEventBroadcaster, useValue: { broadcast } },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: { getOrRecomputeManyOrAllFlatEntityMaps },
        },
        { provide: NavigationMenuItemRecordIdentifierService, useValue: {} },
        { provide: I18nService, useValue: {} },
        {
          provide: ApplicationTranslationCatalogService,
          useValue: { getApplicationAuthorIdentifiers },
        },
      ],
    }).compile();

    publisher = module.get<MetadataEventPublisher>(MetadataEventPublisher);
  });

  const publishAndGetFirstEvent = async (batch: object) => {
    await publisher.publish(batch as unknown as MetadataEventBatch);

    return broadcast.mock.calls[0][0].events[0];
  };

  it('scopes a personal favorite create event to its owner', async () => {
    const event = await publishAndGetFirstEvent({
      name: 'metadata.navigationMenuItem.created',
      workspaceId: 'workspace-1',
      metadataName: 'navigationMenuItem',
      type: 'created',
      events: [
        {
          metadataName: 'navigationMenuItem',
          type: 'created',
          recordId: 'nav-1',
          properties: {
            after: { id: 'nav-1', userWorkspaceId: OWNER_USER_WORKSPACE_ID },
          },
        },
      ],
    });

    expect(event.recipientUserWorkspaceIds).toEqual([OWNER_USER_WORKSPACE_ID]);
  });

  it('scopes a personal favorite update event to its owner', async () => {
    const event = await publishAndGetFirstEvent({
      name: 'metadata.navigationMenuItem.updated',
      workspaceId: 'workspace-1',
      metadataName: 'navigationMenuItem',
      type: 'updated',
      events: [
        {
          metadataName: 'navigationMenuItem',
          type: 'updated',
          recordId: 'nav-1',
          properties: {
            updatedFields: ['name'],
            diff: {},
            before: { id: 'nav-1', userWorkspaceId: OWNER_USER_WORKSPACE_ID },
            after: { id: 'nav-1', userWorkspaceId: OWNER_USER_WORKSPACE_ID },
          },
        },
      ],
    });

    expect(event.recipientUserWorkspaceIds).toEqual([OWNER_USER_WORKSPACE_ID]);
  });

  it('scopes a personal favorite delete event to its owner using the pre-delete record', async () => {
    const event = await publishAndGetFirstEvent({
      name: 'metadata.navigationMenuItem.deleted',
      workspaceId: 'workspace-1',
      metadataName: 'navigationMenuItem',
      type: 'deleted',
      events: [
        {
          metadataName: 'navigationMenuItem',
          type: 'deleted',
          recordId: 'nav-1',
          properties: {
            before: { id: 'nav-1', userWorkspaceId: OWNER_USER_WORKSPACE_ID },
          },
        },
      ],
    });

    expect(event.recipientUserWorkspaceIds).toEqual([OWNER_USER_WORKSPACE_ID]);
  });

  it('broadcasts a workspace-level favorite (null owner) to everyone', async () => {
    const event = await publishAndGetFirstEvent({
      name: 'metadata.navigationMenuItem.created',
      workspaceId: 'workspace-1',
      metadataName: 'navigationMenuItem',
      type: 'created',
      events: [
        {
          metadataName: 'navigationMenuItem',
          type: 'created',
          recordId: 'nav-1',
          properties: {
            after: { id: 'nav-1', userWorkspaceId: null },
          },
        },
      ],
    });

    expect(event.recipientUserWorkspaceIds).toBeUndefined();
  });

  it('does not scope a favorite with an empty-string owner', async () => {
    const event = await publishAndGetFirstEvent({
      name: 'metadata.navigationMenuItem.created',
      workspaceId: 'workspace-1',
      metadataName: 'navigationMenuItem',
      type: 'created',
      events: [
        {
          metadataName: 'navigationMenuItem',
          type: 'created',
          recordId: 'nav-1',
          properties: {
            after: { id: 'nav-1', userWorkspaceId: '' },
          },
        },
      ],
    });

    expect(event.recipientUserWorkspaceIds).toBeUndefined();
  });

  it('does not scope unrelated metadata even when it carries a userWorkspaceId', async () => {
    const event = await publishAndGetFirstEvent({
      name: 'metadata.view.created',
      workspaceId: 'workspace-1',
      metadataName: 'view',
      type: 'created',
      events: [
        {
          metadataName: 'view',
          type: 'created',
          recordId: 'view-1',
          properties: {
            after: {
              id: 'view-1',
              createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
            },
          },
        },
      ],
    });

    expect(event.recipientUserWorkspaceIds).toBeUndefined();
  });

  const personRow = { id: 'morph-row-2', targetNameSingular: 'person' };
  const companyRow = { id: 'morph-row-3', targetNameSingular: 'company' };
  const rocketRow = { id: 'morph-row-1', targetNameSingular: 'rocket' };

  const publishRocketRowDeletion = async () => {
    const before = getMorphRelationGroupFlatEntityMapsMock([
      rocketRow,
      personRow,
      companyRow,
    ]);

    await publisher.publish({
      name: 'metadata.fieldMetadata.deleted',
      workspaceId: 'workspace-1',
      metadataName: 'fieldMetadata',
      type: 'deleted',
      events: [
        {
          metadataName: 'fieldMetadata',
          type: 'deleted',
          recordId: rocketRow.id,
          properties: {
            before: before.getScalarFlatFieldMetadata(rocketRow.id),
          },
        },
      ],
    });

    return broadcast.mock.calls[0][0].events as {
      type: string;
      recordId: string;
      properties: {
        after?: {
          name: string;
          morphRelations: { targetObjectMetadata: { nameSingular: string } }[];
        };
      };
    }[];
  };

  it('hands a morph field over to its new representative when the representative row is deleted', async () => {
    getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
      getMorphRelationGroupFlatEntityMapsMock([personRow, companyRow]),
    );

    const [handedOverEvent, ...deletedEvents] =
      await publishRocketRowDeletion();

    expect(handedOverEvent).toMatchObject({
      type: 'created',
      recordId: personRow.id,
      properties: { after: { name: 'target' } },
    });
    expect(
      handedOverEvent.properties.after?.morphRelations.map(
        (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
      ),
    ).toEqual(['person', 'company']);
    expect(deletedEvents.map(({ type, recordId }) => [type, recordId])).toEqual(
      [
        ['deleted', rocketRow.id],
        ['deleted', companyRow.id],
      ],
    );
  });

  it('skips a row deactivated through overrides when picking the representative', async () => {
    getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
      getMorphRelationGroupFlatEntityMapsMock([
        {
          ...personRow,
          overrides: { 'custom-application': { isActive: false } },
        },
        companyRow,
      ]),
    );

    const [handedOverEvent] = await publishRocketRowDeletion();

    expect(handedOverEvent).toMatchObject({
      type: 'created',
      recordId: companyRow.id,
    });
  });

  it('falls back to raw rows when morph events cannot be collapsed', async () => {
    getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
      getMorphRelationGroupFlatEntityMapsMock([personRow, companyRow]),
    );
    getApplicationAuthorIdentifiers.mockRejectedValue(
      new Error('application lookup failed'),
    );

    const events = await publishRocketRowDeletion();

    expect(events.map(({ type, recordId }) => [type, recordId])).toEqual([
      ['deleted', rocketRow.id],
    ]);
  });
});
