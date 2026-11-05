import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type MetadataTechnicalNamesByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/types/metadata-technical-names-by-universal-identifier.type';
import { FlatEntityMapsExceptionCode } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { projectMetadataTechnicalNames } from 'src/engine/metadata-modules/flat-entity/utils/project-metadata-technical-names.util';
import { TWENTY_STANDARD_ALL_METADATA_NAME } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-all-metadata-name.constant';
import { applyStandardMetadataTechnicalNamesOrThrow } from 'src/engine/workspace-manager/twenty-standard-application/utils/apply-standard-metadata-technical-names-or-throw.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const FACTORY_ARGS = {
  now: '2026-11-05T00:00:00.000Z',
  workspaceId: '20202020-1111-4111-8111-111111111111',
  twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
};

const TECHNICAL_NAMES = {
  objects: {
    [STANDARD_OBJECTS.agentChatThread.universalIdentifier]: {
      nameSingular: 'inboxThread',
      namePlural: 'inboxThreads',
    },
    [STANDARD_OBJECTS.agentMessage.universalIdentifier]: {
      nameSingular: 'inboxMessage',
      namePlural: 'inboxMessages',
    },
  },
  fields: {
    [STANDARD_OBJECTS.agentChatThread.fields.title.universalIdentifier]:
      'subject',
    [STANDARD_OBJECTS.attachment.fields.targetAgentChatThread
      .universalIdentifier]: 'targetInboxThread',
    [STANDARD_OBJECTS.workspaceMember.fields.agentChatThreads
      .universalIdentifier]: 'inboxThreads',
  },
} satisfies MetadataTechnicalNamesByUniversalIdentifier;

const { allFlatEntityMaps: legacyMetadata } =
  computeTwentyStandardApplicationAllFlatEntityMaps(FACTORY_ARGS);

describe('standard metadata technical names', () => {
  it('keeps legacy names as the factory default after an explicit naming override', () => {
    const { allFlatEntityMaps: renamedMetadata } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        ...FACTORY_ARGS,
        technicalNamesByUniversalIdentifier: TECHNICAL_NAMES,
      });
    const { allFlatEntityMaps: defaultMetadata } =
      computeTwentyStandardApplicationAllFlatEntityMaps(FACTORY_ARGS);

    expect(
      renamedMetadata.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ],
    ).toMatchObject({
      nameSingular: 'inboxThread',
      namePlural: 'inboxThreads',
    });
    expect(
      defaultMetadata.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ],
    ).toMatchObject({
      nameSingular: 'agentChatThread',
      namePlural: 'agentChatThreads',
    });
    expect(
      defaultMetadata.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.attachment.fields.targetAgentChatThread
          .universalIdentifier
      ],
    ).toMatchObject({
      name: 'targetAgentChatThread',
      settings: { joinColumnName: 'targetAgentChatThreadId' },
      universalSettings: { joinColumnName: 'targetAgentChatThreadId' },
    });
  });

  it('preserves metadata identities and derived records while aligning renamed owning join columns', () => {
    const renamedMetadata = applyStandardMetadataTechnicalNamesOrThrow({
      allFlatEntityMaps: legacyMetadata,
      technicalNamesByUniversalIdentifier: TECHNICAL_NAMES,
    });
    const originalThread = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: legacyMetadata.flatObjectMetadataMaps,
      universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    });
    const originalAttachmentField = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: legacyMetadata.flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.attachment.fields.targetAgentChatThread
          .universalIdentifier,
    });
    const originalReverseField = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: legacyMetadata.flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.workspaceMember.fields.agentChatThreads
          .universalIdentifier,
    });

    expect(
      renamedMetadata.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ],
    ).toEqual({
      ...originalThread,
      nameSingular: 'inboxThread',
      namePlural: 'inboxThreads',
    });
    expect(
      renamedMetadata.flatFieldMetadataMaps.byUniversalIdentifier[
        originalAttachmentField.universalIdentifier
      ],
    ).toEqual({
      ...originalAttachmentField,
      name: 'targetInboxThread',
      settings: {
        ...originalAttachmentField.settings,
        joinColumnName: 'targetInboxThreadId',
      },
      universalSettings: {
        ...originalAttachmentField.universalSettings,
        joinColumnName: 'targetInboxThreadId',
      },
    });
    expect(
      renamedMetadata.flatFieldMetadataMaps.byUniversalIdentifier[
        originalReverseField.universalIdentifier
      ],
    ).toEqual({ ...originalReverseField, name: 'inboxThreads' });
    expect(
      renamedMetadata.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.fields.title.universalIdentifier
      ],
    ).toMatchObject({
      id: originalThread.labelIdentifierFieldMetadataId,
      name: 'subject',
    });

    for (const metadataName of TWENTY_STANDARD_ALL_METADATA_NAME) {
      const mapsKey = getMetadataFlatEntityMapsKey(metadataName);

      expect(renamedMetadata[mapsKey].universalIdentifierById).toBe(
        legacyMetadata[mapsKey].universalIdentifierById,
      );
    }

    expect(renamedMetadata.flatIndexMaps).toBe(legacyMetadata.flatIndexMaps);
    expect(renamedMetadata.flatRelatedRecordPathMaps).toBe(
      legacyMetadata.flatRelatedRecordPathMaps,
    );
    expect(originalThread.nameSingular).toBe('agentChatThread');
    expect(originalAttachmentField).toMatchObject({
      name: 'targetAgentChatThread',
      settings: { joinColumnName: 'targetAgentChatThreadId' },
    });
  });

  it('keeps storage settings unchanged in the shared name-only projection', () => {
    const projectedMetadata = projectMetadataTechnicalNames({
      metadata: legacyMetadata,
      technicalNamesByUniversalIdentifier: TECHNICAL_NAMES,
    });
    const universalIdentifier =
      STANDARD_OBJECTS.attachment.fields.targetAgentChatThread
        .universalIdentifier;
    const originalField =
      legacyMetadata.flatFieldMetadataMaps.byUniversalIdentifier[
        universalIdentifier
      ];

    expect(
      projectedMetadata.flatFieldMetadataMaps.byUniversalIdentifier[
        universalIdentifier
      ],
    ).toEqual({ ...originalField, name: 'targetInboxThread' });
  });

  it('rejects an unknown field identity in an explicit naming configuration', () => {
    expect(() =>
      applyStandardMetadataTechnicalNamesOrThrow({
        allFlatEntityMaps: legacyMetadata,
        technicalNamesByUniversalIdentifier: {
          objects: {},
          fields: { 'missing-field': 'subject' },
        },
      }),
    ).toThrow(
      expect.objectContaining({
        code: FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      }),
    );
  });
});
