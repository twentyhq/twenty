import { Test, TestingModule } from '@nestjs/testing';

import {
  ORDER_ACTION,
  ORDER_STATUS,
} from '../constants/order-status.constants';
import { MktOrderWorkspaceEntity } from '../objects/mkt-order.workspace-entity';
import { OrderActionService } from '../services/order.action.service';

describe('OrderActionService - Logic Tests', () => {
  let service: OrderActionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderActionService],
    }).compile();

    service = module.get<OrderActionService>(OrderActionService);
  });

  describe('Core Logic Tests', () => {
    it('1. should return CONFIRMED action for DRAFT → CONFIRMED transition', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.DRAFT,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.CONFIRMED);
    });

    it('2. should return PAID action for CONFIRMED → PAID transition', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.CONFIRMED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.PAID },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.PAID);
    });

    it('3. should return PROCESSING action for PAID → PROCESSING transition', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PAID,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.PROCESSING },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.PROCESSING);
    });

    it('4. should return COMPLETED action for PROCESSING → COMPLETED transition', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PROCESSING,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.COMPLETED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.COMPLETED);
    });

    it('5. should return TRIAL action for CONFIRMED → TRIAL transition', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.CONFIRMED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.TRIAL },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.TRIAL);
    });

    it('6. should return TRIAL_TO_CONFIRMED action for trial order PROCESSING → CONFIRMED', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PROCESSING,
        trialLicense: true,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.TRIAL_TO_CONFIRMED);
    });

    it('7. should return LICENSE action for PAID state with licenseStatus=GETTING', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PAID,
        trialLicense: false,
      };
      const payload = {
        data: {
          status: ORDER_STATUS.PAID,
          licenseStatus: 'GETTING',
        },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.LICENSE);
    });

    it('8. should return SINVOICE action for PAID state with sInvoiceStatus=SEND', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PAID,
        trialLicense: false,
      };
      const payload = {
        data: {
          status: ORDER_STATUS.PAID,
          sInvoiceStatus: 'SEND',
        },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.SINVOICE);
    });

    it('9. should return null when no status change (no action needed)', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.CONFIRMED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBeNull();
    });
  });

  describe('Business Rules Tests', () => {
    it('10. should return null for PAID → CONFIRMED (business rule violation)', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PAID,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBeNull();
    });

    it('11. should return null for invalid transitions from final states', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.COMPLETED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.PAID },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBeNull();
    });

    it('12. should return null for invalid transitions from CANCELLED state', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.CANCELLED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.PAID },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBeNull();
    });

    it('16. should return LOCKED action for PROCESSING → LOCKED transition', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PROCESSING,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.LOCKED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.LOCKED);
    });

    it('17. should return CANCELLED action for CONFIRMED → CANCELLED transition', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.CONFIRMED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CANCELLED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.CANCELLED);
    });

    it('18. should return CANCELLED action for PAID → CANCELLED transition', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PAID,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CANCELLED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.CANCELLED);
    });

    it('19. should return CANCELLED action for PROCESSING → CANCELLED transition', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PROCESSING,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CANCELLED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.CANCELLED);
    });

    it('20. should return PROCESSING action for TRIAL → PROCESSING transition', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.TRIAL,
        trialLicense: true,
      };
      const payload = {
        data: { status: ORDER_STATUS.PROCESSING },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.PROCESSING);
    });

    it('21. should return CONFIRMED action for TRIAL → CONFIRMED direct transition', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.TRIAL,
        trialLicense: true,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.CONFIRMED);
    });
  });

  describe('Edge Cases', () => {
    it('13. should handle null currentOrder (new order)', async () => {
      const currentOrder = null;
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.CONFIRMED);
    });

    it('14. should handle currentOrder with undefined status', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: undefined,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBe(ORDER_ACTION.CONFIRMED);
    });

    it('15. should handle payload with no data', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.CONFIRMED,
        trialLicense: false,
      };
      const payload = {
        data: {},
      } as any;

      const result = await service.getAction(payload, currentOrder);

      expect(result).toBeNull();
    });
  });
});
