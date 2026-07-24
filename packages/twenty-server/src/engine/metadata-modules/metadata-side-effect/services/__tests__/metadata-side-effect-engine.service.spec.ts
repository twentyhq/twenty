import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import { MetadataSideEffectEngineService } from 'src/engine/metadata-modules/metadata-side-effect/services/metadata-side-effect-engine.service';

const RESERVED_VIEW_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';

// A handler that, when an object is created, emits a system-side-effect view on
// a fixed (reserved) universal identifier, standing in for the real INDEX view
// provisioning.
const systemViewEmittingHandler = {
  operation: 'create',
  metadataName: 'objectMetadata',
  name: 'fakeSystemViewEmitter',
  buildSideEffects: () => ({
    status: 'success',
    operations: {
      view: {
        flatEntityToCreate: {
          [RESERVED_VIEW_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: RESERVED_VIEW_UNIVERSAL_IDENTIFIER,
            isSystemSideEffect: true,
          },
        },
      },
    },
  }),
};

const buildEngine = () => {
  const registry = {
    getRegisteredHandlerKeys: () => [
      { operation: 'create', metadataName: 'objectMetadata' },
    ],
    getHandlers: (operation: string, metadataName: string) =>
      operation === 'create' && metadataName === 'objectMetadata'
        ? [systemViewEmittingHandler]
        : [],
  };

  return new MetadataSideEffectEngineService(registry as never);
};

const buildInput = ({
  callerViewUniversalIdentifier,
}: {
  callerViewUniversalIdentifier?: string;
}) =>
  ({
    objectMetadata: {
      flatEntityToCreate: {
        [OBJECT_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        },
      },
      flatEntityToUpdate: {},
      flatEntityToDelete: {},
    },
    view: {
      flatEntityToCreate:
        callerViewUniversalIdentifier === undefined
          ? {}
          : {
              [callerViewUniversalIdentifier]: {
                universalIdentifier: callerViewUniversalIdentifier,
                isSystemSideEffect: false,
              },
            },
      flatEntityToUpdate: {},
      flatEntityToDelete: {},
    },
  }) as never;

describe('MetadataSideEffectEngineService reserved identifier collision', () => {
  it('should reject a caller-defined entity whose universal identifier collides with a system side effect one', () => {
    const engine = buildEngine();

    const result = engine.expandWithSideEffects({
      allFlatEntityOperationRecordByMetadataName: buildInput({
        callerViewUniversalIdentifier: RESERVED_VIEW_UNIVERSAL_IDENTIFIER,
      }),
      sideEffectRelatedFlatEntityMaps: {},
      context: {} as never,
    });

    expect(result.status).toBe('fail');

    if (result.status !== 'fail') {
      throw new Error('expected fail');
    }

    const viewFailures = result.report.view;

    expect(viewFailures).toHaveLength(1);
    expect(viewFailures[0].errors[0].code).toBe(
      MetadataSideEffectExceptionCode.RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER,
    );
  });

  it('should let a caller-defined entity through when its universal identifier does not collide', () => {
    const engine = buildEngine();

    const result = engine.expandWithSideEffects({
      allFlatEntityOperationRecordByMetadataName: buildInput({
        callerViewUniversalIdentifier: 'c1c2c3c4-c5c6-4000-8000-000000000001',
      }),
      sideEffectRelatedFlatEntityMaps: {},
      context: {} as never,
    });

    expect(result.status).toBe('success');
  });
});
