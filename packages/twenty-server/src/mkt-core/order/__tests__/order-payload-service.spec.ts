import { Test, TestingModule } from '@nestjs/testing';

import {
  ORDER_ACTION,
  ORDER_STATUS,
} from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';
import { OrderPayloadService } from 'src/mkt-core/order/services/order.payload.service';

describe('OrderPayloadService - Logic Tests', () => {
  let service: OrderPayloadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderPayloadService],
    }).compile();

    service = module.get<OrderPayloadService>(OrderPayloadService);
  });

  describe('Core Logic Tests', () => {
    it('1. should return payload with CONFIRMED status for CONFIRMED action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.DRAFT,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;
      const action = ORDER_ACTION.CONFIRMED;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.CONFIRMED);
    });

    it('2. should return payload with PAID status for PAID action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.CONFIRMED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.PAID },
      } as any;
      const action = ORDER_ACTION.PAID;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.PAID);
    });

    it('3. should return payload with PROCESSING status for PROCESSING action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PAID,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.PROCESSING },
      } as any;
      const action = ORDER_ACTION.PROCESSING;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.PROCESSING);
    });

    it('4. should return payload with COMPLETED status for COMPLETED action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PROCESSING,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.COMPLETED },
      } as any;
      const action = ORDER_ACTION.COMPLETED;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.COMPLETED);
    });

    it('5. should return payload with TRIAL status for TRIAL action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.CONFIRMED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.TRIAL },
      } as any;
      const action = ORDER_ACTION.TRIAL;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.TRIAL);
    });

    it('6. should return payload with CONFIRMED status and trialLicense=true for TRIAL_TO_CONFIRMED action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PROCESSING,
        trialLicense: true,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;
      const action = ORDER_ACTION.TRIAL_TO_CONFIRMED;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.CONFIRMED);
      expect(result.data?.trialLicense).toBe(true);
    });

    it('7. should return payload with only licenseStatus for LICENSE action', async () => {
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
      const action = ORDER_ACTION.LICENSE;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.licenseStatus).toBe('GETTING');
      expect(result.data?.status).toBeUndefined();
    });

    it('8. should return payload with only sInvoiceStatus for SINVOICE action', async () => {
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
      const action = ORDER_ACTION.SINVOICE;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.sInvoiceStatus).toBe('SEND');
      expect(result.data?.status).toBeUndefined();
    });

    it('9. should return original payload when action is null', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.CONFIRMED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;
      const action = null;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result).toEqual(payload);
    });
  });

  describe('Business Rules Tests', () => {
    it('10. should throw error for CONFIRMED action in PAID state (business rule)', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PAID,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;
      const action = ORDER_ACTION.CONFIRMED;

      await expect(
        service.getNewPayload(payload, action, currentOrder),
      ).rejects.toThrow('Invalid action CONFIRMED for PaidState');
    });

    it('11. should throw error for invalid actions in final states', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.COMPLETED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.PAID },
      } as any;
      const action = ORDER_ACTION.PAID;

      await expect(
        service.getNewPayload(payload, action, currentOrder),
      ).rejects.toThrow('No actions available for CompletedState');
    });

    it('16. should return payload with LOCKED status for PROCESSING → LOCKED action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PROCESSING,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.LOCKED },
      } as any;
      const action = ORDER_ACTION.LOCKED;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.LOCKED);
    });

    it('17. should return payload with CANCELLED status for CONFIRMED → CANCELLED action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.CONFIRMED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CANCELLED },
      } as any;
      const action = ORDER_ACTION.CANCELLED;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.CANCELLED);
    });

    it('18. should return payload with CANCELLED status for PAID → CANCELLED action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PAID,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CANCELLED },
      } as any;
      const action = ORDER_ACTION.CANCELLED;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.CANCELLED);
    });

    it('19. should return payload with CANCELLED status for PROCESSING → CANCELLED action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.PROCESSING,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CANCELLED },
      } as any;
      const action = ORDER_ACTION.CANCELLED;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.CANCELLED);
    });

    it('20. should return payload with PROCESSING status for TRIAL → PROCESSING action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.TRIAL,
        trialLicense: true,
      };
      const payload = {
        data: { status: ORDER_STATUS.PROCESSING },
      } as any;
      const action = ORDER_ACTION.PROCESSING;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.PROCESSING);
    });

    it('21. should return payload with CONFIRMED status for TRIAL → CONFIRMED direct action', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.TRIAL,
        trialLicense: true,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;
      const action = ORDER_ACTION.CONFIRMED;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.CONFIRMED);
    });
  });

  describe('Edge Cases', () => {
    it('12. should return original payload when action is null', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.CONFIRMED,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;
      const action = null;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result).toEqual(payload);
    });

    it('13. should handle null currentOrder (new order)', async () => {
      const currentOrder = null;
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;
      const action = ORDER_ACTION.CONFIRMED;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.CONFIRMED);
    });

    it('14. should handle currentOrder with undefined status', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: undefined,
        trialLicense: false,
      };
      const payload = {
        data: { status: ORDER_STATUS.CONFIRMED },
      } as any;
      const action = ORDER_ACTION.CONFIRMED;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.CONFIRMED);
    });

    it('15. should preserve additional fields in payload for DRAFT → CONFIRMED', async () => {
      const currentOrder: Partial<MktOrderWorkspaceEntity> = {
        status: ORDER_STATUS.DRAFT,
        trialLicense: false,
      };
      const payload = {
        data: {
          status: ORDER_STATUS.CONFIRMED,
          name: 'Test Order',
        },
      } as any;
      const action = ORDER_ACTION.CONFIRMED;

      const result = await service.getNewPayload(payload, action, currentOrder);

      expect(result.data?.status).toBe(ORDER_STATUS.CONFIRMED);
      expect(result.data?.name).toBe('Test Order');
    });
  });
});
