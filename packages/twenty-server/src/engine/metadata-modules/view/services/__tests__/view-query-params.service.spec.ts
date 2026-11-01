import {
  FieldMetadataType,
  ViewFilterOperand,
  ViewVisibility,
} from 'twenty-shared/types';

import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';
import { type ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

jest.mock('src/engine/metadata-modules/view/services/view.service', () => ({
  ViewService: class {},
}));
jest.mock(
  'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service',
  () => ({
    WorkspaceManyOrAllFlatEntityMapsCacheService: class {},
  }),
);
jest.mock('src/engine/twenty-orm/workspace-orm.manager', () => ({
  WorkspaceOrmManager: class {},
}));

describe('ViewQueryParamsService', () => {
  it.each([
    ['stored array', ['QUALIFIED', 'NEW']],
    ['serialized array', '["QUALIFIED","NEW"]'],
  ])('preserves select filtering for a %s', async (_description, value) => {
    const field = {
      id: 'field-id',
      universalIdentifier: 'field-universal-identifier',
      name: 'stage',
      type: FieldMetadataType.SELECT,
    };
    const object = {
      id: 'object-id',
      universalIdentifier: 'object-universal-identifier',
      nameSingular: 'company',
    };
    const viewService = {
      findByIdWithRelations: jest.fn().mockResolvedValue({
        objectMetadataId: object.id,
        visibility: ViewVisibility.WORKSPACE,
        viewFilters: [
          {
            id: 'filter-id',
            fieldMetadataId: field.id,
            operand: ViewFilterOperand.IS,
            value,
          },
        ],
      }),
    };
    const flatEntityMapsCacheService = {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: {
          universalIdentifierById: { [object.id]: object.universalIdentifier },
          byUniversalIdentifier: { [object.universalIdentifier]: object },
        },
        flatFieldMetadataMaps: {
          universalIdentifierById: { [field.id]: field.universalIdentifier },
          byUniversalIdentifier: { [field.universalIdentifier]: field },
        },
      }),
    };
    const service = new ViewQueryParamsService(
      viewService as unknown as ViewService,
      flatEntityMapsCacheService as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
      {} as WorkspaceOrmManager,
    );

    const result = await service.resolveViewToQueryParams({
      viewId: 'view-id',
      workspaceId: 'workspace-id',
    });

    expect(result.filter).toEqual({ stage: { in: ['QUALIFIED', 'NEW'] } });
  });
});
