import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { buildFailedWorkspaceMigrationResultFromFlatEntityMapsException } from 'src/engine/workspace-manager/workspace-migration/services/utils/build-failed-workspace-migration-result-from-flat-entity-maps-exception.util';

describe('buildFailedWorkspaceMigrationResultFromFlatEntityMapsException', () => {
  it('should use the first metadata map key as the failed metadata name', () => {
    const result =
      buildFailedWorkspaceMigrationResultFromFlatEntityMapsException({
        error: new FlatEntityMapsException(
          'Could not find flat entity with universal identifier 123',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        ),
        fromToAllFlatEntityMaps: {
          flatViewMaps: {
            from: {
              byId: {},
              idByUniversalIdentifier: {},
              byUniversalIdentifier: {},
            },
            to: {
              byId: {},
              idByUniversalIdentifier: {},
              byUniversalIdentifier: {},
            },
          },
        },
      });

    expect(result.status).toBe('fail');
    expect(result.report.view).toHaveLength(1);
    expect(result.report.view[0].errors[0].code).toBe(
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
    expect(result.report.view[0].errors[0].message).toBe(
      'Could not find flat entity with universal identifier 123',
    );
    expect(result.report.view[0].errors[0].userFriendlyMessage).toBeDefined();
  });

  it('should fallback to objectMetadata when no map keys are provided', () => {
    const result =
      buildFailedWorkspaceMigrationResultFromFlatEntityMapsException({
        error: new FlatEntityMapsException(
          'Missing relation',
          FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
        ),
        fromToAllFlatEntityMaps: {},
      });

    expect(result.report[ALL_METADATA_NAME.objectMetadata]).toHaveLength(1);
  });
});
