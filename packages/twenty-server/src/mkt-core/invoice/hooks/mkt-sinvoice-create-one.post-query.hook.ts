import { Injectable, Logger } from '@nestjs/common';

import { WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktSInvoiceItemWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-item.workspace-entity';
import { MktSInvoiceMetadataWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-metadata.workspace-entity';
import { MktSInvoicePaymentWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-payment.workspace-entity';
import { MktSInvoiceTaxBreakdownWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-tax-breakdown.workspace-entity';
import { MktSInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice.workspace-entity';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order-item.workspace-entity';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';

@Injectable()
@WorkspaceQueryHook({
  key: 'mktSInvoice.createOne',
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class MktSInvoiceCreateOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  private readonly logger = new Logger(MktSInvoiceCreateOnePostQueryHook.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: MktSInvoiceWorkspaceEntity[],
  ): Promise<void> {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) return;

    const created = payload?.[0];

    if (!created) return;

    try {
      const sInvoiceItemRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoiceItemWorkspaceEntity>(
          workspaceId,
          'mktSInvoiceItem',
          { shouldBypassPermissionChecks: true },
        );
      const sInvoiceRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoiceWorkspaceEntity>(
          workspaceId,
          'mktSInvoice',
          { shouldBypassPermissionChecks: true },
        );
      const orderRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderWorkspaceEntity>(
          workspaceId,
          'mktOrder',
          { shouldBypassPermissionChecks: true },
        );

      // 1) prioritize using items already calculated from pre-hook if available
      const meta = (created as unknown as Record<string, any>)
        .__preComputedItems as
        | Array<Partial<MktSInvoiceItemWorkspaceEntity>>
        | undefined;

      let itemsPayload: Array<Partial<MktSInvoiceItemWorkspaceEntity>> = [];

      if (meta && meta.length > 0) {
        itemsPayload = meta;
      } else if (created.mktOrderId) {
        // 2) if no meta, calculate from OrderItems
        const orderItemRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderItemWorkspaceEntity>(
            workspaceId,
            'mktOrderItem',
            { shouldBypassPermissionChecks: true },
          );

        const orderItems = await orderItemRepository.find({
          where: { mktOrderId: created.mktOrderId } as any,
        });
        const order = await orderRepository.findOne({
          where: { id: created.mktOrderId },
        });

        if (!orderItems || orderItems.length === 0) {
          this.logger.log(
            '[SInvoice POST HOOK] Order has no items. Skip item creation.',
          );

          return;
        }

        const computed = orderItems.map((orderItem, index) => {
          const quantity = orderItem.quantity ?? 1;
          const unitPrice = orderItem.unitPrice ?? 0;
          const amountWithoutTax = unitPrice * quantity;
          const taxPercent = (orderItem.taxPercentage ?? 0) as number;
          const taxAmount = Math.round((amountWithoutTax * taxPercent) / 100);
          const withTax = amountWithoutTax + taxAmount;

          return {
            name:
              orderItem.name ||
              orderItem.snapshotProductName ||
              `Item ${index + 1}`,
            lineNumber: index + 1,
            selection: 1,
            itemCode: orderItem.mktProductId
              ? `MKT_${orderItem.mktProductId}`
              : null,
            itemName:
              orderItem.name ||
              orderItem.snapshotProductName ||
              `Item ${index + 1}`,
            unitName: orderItem.unitName || 'unit',
            quantity,
            unitPrice,
            itemTotalAmountWithoutTax: amountWithoutTax,
            itemTotalAmountAfterDiscount: amountWithoutTax,
            itemTotalAmountWithTax: withTax,
            taxPercentage: taxPercent,
            taxAmount,
            discount: 0,
            itemDiscount: 0,
            itemNote: undefined,
            isIncreaseItem: false,
            position: index + 1,
          } as Partial<MktSInvoiceItemWorkspaceEntity>;
        });

        itemsPayload = computed;
      } else {
        this.logger.log('[SInvoice POST HOOK] No orderId and no meta. Skip.');

        return;
      }

      const itemsToCreate = await Promise.all(
        itemsPayload.map(async (item) => {
          const position = await this.recordPositionService.buildRecordPosition(
            {
              value: 'last',
              objectMetadata: {
                isCustom: false,
                nameSingular: 'mktSInvoiceItem',
              },
              workspaceId,
            },
          );

          return sInvoiceItemRepository.create({
            ...item,
            mktSInvoiceId: created.id,
            position,
          } as Partial<MktSInvoiceItemWorkspaceEntity>);
        }),
      );

      await sInvoiceItemRepository.save(
        itemsToCreate as MktSInvoiceItemWorkspaceEntity[],
      );

      // ===== Create Metadata =====
      const metaMeta = (created as unknown as Record<string, any>)
        .__preComputedMetadata as
        | Array<Partial<MktSInvoiceMetadataWorkspaceEntity>>
        | undefined;

      if (metaMeta && metaMeta.length > 0) {
        const metadataRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoiceMetadataWorkspaceEntity>(
            workspaceId,
            'mktSInvoiceMetadata',
            { shouldBypassPermissionChecks: true },
          );

        const metadataToCreate = await Promise.all(
          metaMeta.map(async (m) => {
            const position =
              await this.recordPositionService.buildRecordPosition({
                value: 'last',
                objectMetadata: {
                  isCustom: false,
                  nameSingular: 'mktSInvoiceMetadata',
                },
                workspaceId,
              });

            return metadataRepository.create({
              ...m,
              mktSInvoiceId: created.id,
              position,
            } as Partial<MktSInvoiceMetadataWorkspaceEntity>);
          }),
        );

        await metadataRepository.save(
          metadataToCreate as MktSInvoiceMetadataWorkspaceEntity[],
        );
      } else if (created.mktOrderId) {
        const metadataRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoiceMetadataWorkspaceEntity>(
            workspaceId,
            'mktSInvoiceMetadata',
            { shouldBypassPermissionChecks: true },
          );
        // auto fill some metadata from order/SInvoice
        const baseMetadata: Array<Partial<MktSInvoiceMetadataWorkspaceEntity>> =
          [
            {
              name: 'Order Code',
              keyLabel: 'orderCode',
              keyTag: 'ORDER_CODE',
              stringValue: (created as any).transactionUuid,
            },
            {
              name: 'Buyer Name',
              keyLabel: 'buyerName',
              keyTag: 'BUYER_NAME',
              stringValue: created.buyerName,
            },
            {
              name: 'Currency',
              keyLabel: 'currency',
              keyTag: 'CURRENCY',
              stringValue: created.currencyCode,
            },
            {
              name: 'Total With Tax',
              keyLabel: 'totalAmountWithTax',
              keyTag: 'TOTAL_WITH_TAX',
              stringValue: String(created.totalAmountWithTax ?? ''),
            },
          ];
        const metadataToCreate = await Promise.all(
          baseMetadata.map(async (m) => {
            const position =
              await this.recordPositionService.buildRecordPosition({
                value: 'last',
                objectMetadata: {
                  isCustom: false,
                  nameSingular: 'mktSInvoiceMetadata',
                },
                workspaceId,
              });

            return metadataRepository.create({
              ...m,
              mktSInvoiceId: created.id,
              position,
            } as Partial<MktSInvoiceMetadataWorkspaceEntity>);
          }),
        );
        //await metadataRepository.save(metadataToCreate as MktSInvoiceMetadataWorkspaceEntity[]);
      }

      // ===== Create Payments =====
      const metaPayments = (created as unknown as Record<string, any>)
        .__preComputedPayments as
        | Array<Partial<MktSInvoicePaymentWorkspaceEntity>>
        | undefined;

      if (metaPayments && metaPayments.length > 0) {
        const paymentRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoicePaymentWorkspaceEntity>(
            workspaceId,
            'mktSInvoicePayment',
            { shouldBypassPermissionChecks: true },
          );

        const paymentsToCreate = await Promise.all(
          metaPayments.map(async (p) => {
            const position =
              await this.recordPositionService.buildRecordPosition({
                value: 'last',
                objectMetadata: {
                  isCustom: false,
                  nameSingular: 'mktSInvoicePayment',
                },
                workspaceId,
              });

            return paymentRepository.create({
              ...p,
              mktSInvoiceId: created.id,
              position,
            } as Partial<MktSInvoicePaymentWorkspaceEntity>);
          }),
        );

        await paymentRepository.save(
          paymentsToCreate as MktSInvoicePaymentWorkspaceEntity[],
        );
      } else if (created.mktOrderId) {
        const paymentRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoicePaymentWorkspaceEntity>(
            workspaceId,
            'mktSInvoicePayment',
            { shouldBypassPermissionChecks: true },
          );
        const position = await this.recordPositionService.buildRecordPosition({
          value: 'last',
          objectMetadata: {
            isCustom: false,
            nameSingular: 'mktSInvoicePayment',
          },
          workspaceId,
        });
        const autoPayment = paymentRepository.create({
          name: 'Payment for Order ' + created.name,
          amount:
            created.totalAmountWithTax ??
            created.totalAmountAfterDiscount ??
            created.totalAmountWithoutTax ??
            0,
          currency: created.currencyCode ?? 'VND',
          paymentDate: undefined,
          paymentMethodName: 'Thanh toán bằng tiền mặt',
          description: undefined,
          status: created.paymentStatus ? 1 : 0,
          mktSInvoiceId: created.id,
          position,
        } as Partial<MktSInvoicePaymentWorkspaceEntity>);

        await paymentRepository.save([
          autoPayment,
        ] as MktSInvoicePaymentWorkspaceEntity[]);
      }

      // ===== Create Tax Breakdowns =====
      const metaTax = (created as unknown as Record<string, any>)
        .__preComputedTaxBreakdowns as
        | Array<Partial<MktSInvoiceTaxBreakdownWorkspaceEntity>>
        | undefined;

      if (metaTax && metaTax.length > 0) {
        const taxRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoiceTaxBreakdownWorkspaceEntity>(
            workspaceId,
            'mktSInvoiceTaxBreakdown',
            { shouldBypassPermissionChecks: true },
          );

        const taxesToCreate = await Promise.all(
          metaTax.map(async (t) => {
            const position =
              await this.recordPositionService.buildRecordPosition({
                value: 'last',
                objectMetadata: {
                  isCustom: false,
                  nameSingular: 'mktSInvoiceTaxBreakdown',
                },
                workspaceId,
              });

            return taxRepository.create({
              ...t,
              mktSInvoiceId: created.id,
              position,
            } as Partial<MktSInvoiceTaxBreakdownWorkspaceEntity>);
          }),
        );

        await taxRepository.save(
          taxesToCreate as MktSInvoiceTaxBreakdownWorkspaceEntity[],
        );
      } else if (created.mktOrderId) {
        const taxRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoiceTaxBreakdownWorkspaceEntity>(
            workspaceId,
            'mktSInvoiceTaxBreakdown',
            { shouldBypassPermissionChecks: true },
          );
        // group by taxPercentage from OrderItems and sum up
        const orderItemRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderItemWorkspaceEntity>(
            workspaceId,
            'mktOrderItem',
            { shouldBypassPermissionChecks: true },
          );
        const orderItemsForTax = await orderItemRepository.find({
          where: { mktOrderId: created.mktOrderId } as any,
        });
        const groups = new Map<
          number,
          { taxableAmount: number; taxAmount: number }
        >();

        orderItemsForTax.forEach((oi) => {
          const quantity = oi.quantity ?? 1;
          const unitPrice = oi.unitPrice ?? 0;
          const amountWithoutTax = unitPrice * quantity;
          const taxPercent = (oi.taxPercentage ?? 0) as number;
          const taxAmount = Math.round((amountWithoutTax * taxPercent) / 100);
          const g = groups.get(taxPercent) || {
            taxableAmount: 0,
            taxAmount: 0,
          };

          g.taxableAmount += amountWithoutTax;
          g.taxAmount += taxAmount;
          groups.set(taxPercent, g);
        });
        const taxesToCreate = await Promise.all(
          Array.from(groups.entries()).map(
            async ([taxPercentage, agg], idx) => {
              const position =
                await this.recordPositionService.buildRecordPosition({
                  value: 'last',
                  objectMetadata: {
                    isCustom: false,
                    nameSingular: 'mktSInvoiceTaxBreakdown',
                  },
                  workspaceId,
                });

              return taxRepository.create({
                name: `VAT ${taxPercentage}%`,
                taxableAmount: agg.taxableAmount,
                taxAmount: agg.taxAmount,
                taxPercentage,
                mktSInvoiceId: created.id,
                position,
              } as Partial<MktSInvoiceTaxBreakdownWorkspaceEntity>);
            },
          ),
        );

        if (taxesToCreate.length > 0) {
          await taxRepository.save(
            taxesToCreate as MktSInvoiceTaxBreakdownWorkspaceEntity[],
          );
        }
      }

      // ===== Soft-delete other SInvoices of the same order (keep the newly created) =====
      if (created.mktOrderId) {
        const sameOrderInvoices = await sInvoiceRepository.find({
          where: { mktOrderId: created.mktOrderId } as any,
        });

        const idsToDelete = sameOrderInvoices
          .filter((inv) => inv.id !== created.id)
          .map((inv) => inv.id);

        if (idsToDelete.length > 0) {
          await sInvoiceRepository.softDelete(idsToDelete);
          this.logger.log(
            `[SInvoice POST HOOK] Soft-deleted ${idsToDelete.length} SInvoices for order ${created.mktOrderId}`,
          );
        }
      }
    } catch (error) {
      this.logger.error('[SInvoice POST HOOK] Failed to create items', error);
    }
  }
}
