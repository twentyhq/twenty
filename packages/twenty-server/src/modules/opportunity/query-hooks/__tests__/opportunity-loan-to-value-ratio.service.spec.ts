import { Test, type TestingModule } from '@nestjs/testing';

import { type CurrencyMetadata } from 'twenty-shared/types';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { OpportunityLoanToValueRatioService } from 'src/modules/opportunity/query-hooks/opportunity-loan-to-value-ratio.service';

const buildFlatEntityMaps = ({
  hasFarmPropertyValue,
  hasLoanToValueRatio,
}: {
  hasFarmPropertyValue: boolean;
  hasLoanToValueRatio: boolean;
}) => {
  const fieldIds = [
    'amount-id',
    ...(hasFarmPropertyValue ? ['farmPropertyValue-id'] : []),
    ...(hasLoanToValueRatio ? ['loanToValueRatio-id'] : []),
  ];

  return {
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        'opportunity-universal-id': {
          id: 'opportunity-id',
          nameSingular: 'opportunity',
          fieldIds,
          universalIdentifier: 'opportunity-universal-id',
        },
      },
      universalIdentifierById: {
        'opportunity-id': 'opportunity-universal-id',
      },
      universalIdentifiersByApplicationId: {},
    },
    flatFieldMetadataMaps: {
      byUniversalIdentifier: {
        'amount-universal-id': {
          id: 'amount-id',
          name: 'amount',
          objectMetadataId: 'opportunity-id',
          universalIdentifier: 'amount-universal-id',
        },
        'farmPropertyValue-universal-id': {
          id: 'farmPropertyValue-id',
          name: 'farmPropertyValue',
          objectMetadataId: 'opportunity-id',
          universalIdentifier: 'farmPropertyValue-universal-id',
        },
        'loanToValueRatio-universal-id': {
          id: 'loanToValueRatio-id',
          name: 'loanToValueRatio',
          objectMetadataId: 'opportunity-id',
          universalIdentifier: 'loanToValueRatio-universal-id',
        },
      },
      universalIdentifierById: {
        'amount-id': 'amount-universal-id',
        'farmPropertyValue-id': 'farmPropertyValue-universal-id',
        'loanToValueRatio-id': 'loanToValueRatio-universal-id',
      },
      universalIdentifiersByApplicationId: {},
    },
  };
};

const currency = (amountMicros: number): CurrencyMetadata => ({
  amountMicros,
  currencyCode: 'USD',
});

describe('OpportunityLoanToValueRatioService', () => {
  let service: OpportunityLoanToValueRatioService;
  let getOrRecomputeManyOrAllFlatEntityMaps: jest.Mock;

  beforeEach(async () => {
    getOrRecomputeManyOrAllFlatEntityMaps = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunityLoanToValueRatioService,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps,
          },
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OpportunityLoanToValueRatioService>(
      OpportunityLoanToValueRatioService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateLoanToValueRatio', () => {
    it('computes the raw fraction (not multiplied by 100)', () => {
      const result = service.calculateLoanToValueRatio(
        currency(150_000_000_000),
        currency(200_000_000_000),
      );

      expect(result).toBe(0.75);
    });

    it('returns null when loan amount is missing', () => {
      const result = service.calculateLoanToValueRatio(
        null,
        currency(200_000_000_000),
      );

      expect(result).toBeNull();
    });

    it('returns null when farm property value is missing', () => {
      const result = service.calculateLoanToValueRatio(
        currency(150_000_000_000),
        undefined,
      );

      expect(result).toBeNull();
    });

    it('returns null when farm property value is zero', () => {
      const result = service.calculateLoanToValueRatio(
        currency(150_000_000_000),
        currency(0),
      );

      expect(result).toBeNull();
    });
  });

  describe('areLoanToValueFieldsEnabled', () => {
    it('returns true when both custom fields exist for the workspace', async () => {
      getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        buildFlatEntityMaps({
          hasFarmPropertyValue: true,
          hasLoanToValueRatio: true,
        }),
      );

      const result = await service.areLoanToValueFieldsEnabled('workspace-id');

      expect(result).toBe(true);
    });

    it('returns false when the fields do not exist for the workspace', async () => {
      getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        buildFlatEntityMaps({
          hasFarmPropertyValue: false,
          hasLoanToValueRatio: false,
        }),
      );

      const result = await service.areLoanToValueFieldsEnabled('workspace-id');

      expect(result).toBe(false);
    });

    it('returns false when only one of the two fields exists', async () => {
      getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        buildFlatEntityMaps({
          hasFarmPropertyValue: true,
          hasLoanToValueRatio: false,
        }),
      );

      const result = await service.areLoanToValueFieldsEnabled('workspace-id');

      expect(result).toBe(false);
    });
  });
});
