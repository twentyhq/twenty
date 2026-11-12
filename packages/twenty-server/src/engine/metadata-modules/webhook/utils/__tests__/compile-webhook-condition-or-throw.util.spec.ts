import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { compileWebhookConditionOrThrow } from 'src/engine/metadata-modules/webhook/utils/compile-webhook-condition-or-throw.util';
import { WebhookException } from 'src/engine/metadata-modules/webhook/webhook.exception';

const STAGE_FIELD = getFlatFieldMetadataMock({
  id: 'opportunity-stage-id',
  universalIdentifier: 'opportunity-stage',
  objectMetadataId: 'opportunity-id',
  type: FieldMetadataType.TEXT,
  name: 'stage',
});
const COMPANY_NAME_FIELD = getFlatFieldMetadataMock({
  id: 'company-name-id',
  universalIdentifier: 'company-name',
  objectMetadataId: 'company-id',
  type: FieldMetadataType.TEXT,
  name: 'name',
});

const flatFieldMetadataMaps = [STAGE_FIELD, COMPANY_NAME_FIELD].reduce(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
);
const flatObjectMetadataMaps = [
  getFlatObjectMetadataMock({
    id: 'opportunity-id',
    universalIdentifier: 'opportunity',
    nameSingular: 'opportunity',
    fieldIds: [STAGE_FIELD.id],
  }),
  getFlatObjectMetadataMock({
    id: 'company-id',
    universalIdentifier: 'company',
    nameSingular: 'company',
    fieldIds: [COMPANY_NAME_FIELD.id],
  }),
].reduce(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>,
);

const compile = ({
  condition,
  operations,
}: {
  condition: string | null;
  operations: string[];
}) =>
  compileWebhookConditionOrThrow({
    condition,
    operations,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('compileWebhookConditionOrThrow', () => {
  it('returns the fields a condition on one object reads', () => {
    expect(
      compile({
        condition: "previous.stage != stage and stage == 'WON'",
        operations: ['opportunity.updated', 'opportunity.created'],
      }),
    ).toEqual({
      stage: 'opportunity-stage',
      'previous.stage': 'opportunity-stage',
    });
  });

  it('keeps no bindings when names can point to fields of several objects', () => {
    expect(
      compile({
        condition: "stage == 'WON'",
        operations: ['*.created', 'opportunity.created'],
      }),
    ).toBeNull();
  });

  it('accepts a condition on the fields of the operation object', () => {
    expect(() =>
      compile({
        condition: "previous.stage != stage and stage == 'WON'",
        operations: ['opportunity.updated', 'opportunity.created'],
      }),
    ).not.toThrow();
  });

  it('accepts no condition', () => {
    expect(() =>
      compile({ condition: null, operations: ['unknown.created'] }),
    ).not.toThrow();
  });

  it('rejects a field the operation object lacks', () => {
    expect(() =>
      compile({
        condition: "stage == 'WON'",
        operations: ['opportunity.created', 'company.created'],
      }),
    ).toThrow(WebhookException);
  });

  it('rejects an operation on an unknown object', () => {
    expect(() =>
      compile({
        condition: "stage == 'WON'",
        operations: ['unknown.created'],
      }),
    ).toThrow('Unknown object unknown');
  });

  it('leaves wildcard objects and metadata operations to match time', () => {
    expect(() =>
      compile({
        condition: "stage == 'WON'",
        operations: ['*.created', 'metadata.*.*', 'opportunity.created'],
      }),
    ).not.toThrow();
  });
});
