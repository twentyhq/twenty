import { Injectable, Logger } from '@nestjs/common';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktSInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice.workspace-entity';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order-item.workspace-entity';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';

@Injectable()
@WorkspaceQueryHook('mktSInvoice.createOne')
export class MktSInvoiceCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  private readonly logger = new Logger(MktSInvoiceCreateOnePreQueryHook.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<MktSInvoiceWorkspaceEntity>,
  ): Promise<CreateOneResolverArgs<MktSInvoiceWorkspaceEntity>> {
    const input = payload?.data;
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    this.logger.log(
      `Creating MktSInvoice with input: ${JSON.stringify(input)}`,
    );

    if (!workspaceId || !input?.mktOrderId) {
      this.logger.warn(
        'Missing workspaceId or mktOrderId, skipping data population',
      );

      return payload;
    }

    try {
      // get order and orderItems
      const orderRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderWorkspaceEntity>(
          workspaceId,
          'mktOrder',
          { shouldBypassPermissionChecks: true },
        );

      const orderItemRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderItemWorkspaceEntity>(
          workspaceId,
          'mktOrderItem',
          { shouldBypassPermissionChecks: true },
        );

      const order = await orderRepository.findOne({
        where: { id: input.mktOrderId },
      });

      if (!order) {
        this.logger.warn(`Order not found with ID: ${input.mktOrderId}`);

        return payload;
      }

      const orderItems = await orderItemRepository.find({
        where: { mktOrderId: input.mktOrderId } as any,
      });

      if (!orderItems || orderItems.length === 0) {
        this.logger.warn(
          `Order ${input.mktOrderId} has no items; skip data population`,
        );

        return payload;
      }

      // calculate information from orderItems
      const itemInfo = orderItems.map((item, idx) => {
        const quantity = item.quantity ?? 1;
        const unitPrice = item.unitPrice ?? 0;
        const amountWithoutTax = unitPrice * quantity;
        const taxPercent = (item.taxPercentage ?? 0) as number;
        const taxAmount = Math.round((amountWithoutTax * taxPercent) / 100);
        const withTax = amountWithoutTax + taxAmount;

        return {
          lineNumber: idx + 1,
          itemName: item.name || item.snapshotProductName || `Item ${idx + 1}`,
          unitName: item.unitName || 'unit',
          quantity,
          unitPrice,
          itemTotalAmountWithoutTax: amountWithoutTax,
          itemTotalAmountWithTax: withTax,
          taxPercentage: taxPercent,
          taxAmount,
        };
      });

      // sum up
      const totalAmountWithoutTax = itemInfo.reduce(
        (sum, item) => sum + item.itemTotalAmountWithoutTax,
        0,
      );

      const totalTaxAmount = itemInfo.reduce(
        (sum, item) => sum + item.taxAmount,
        0,
      );

      const totalAmountWithTax = totalAmountWithoutTax + totalTaxAmount;

      // create name for SInvoice if not exists
      const sInvoiceName =
        input.name || `SInvoice - ${order.orderCode || order.name}`;

      // update input with information from order and orderItems
      const updatedInput = {
        ...input,
        name: sInvoiceName,
        // information from order
        buyerName: input.buyerName || order.name,
        buyerTaxCode: input.buyerTaxCode || null, // Có thể lấy từ customer info nếu có
        buyerAddressLine: input.buyerAddressLine || null,
        buyerPhoneNumber: input.buyerPhoneNumber || null,
        buyerEmail: input.buyerEmail || null,
        currencyCode: input.currencyCode || order.currency || 'VND',
        // information calculated from orderItems
        sumOfTotalLineAmountWithoutTax: totalAmountWithoutTax,
        totalAmountWithoutTax: totalAmountWithoutTax,
        totalTaxAmount: totalTaxAmount,
        totalAmountWithTax: totalAmountWithTax,
        totalAmountWithTaxInWords: this.numberToWords(totalAmountWithTax),
        totalAmountAfterDiscount: order.totalAmount,
        // default information for SInvoice
        invoiceType: input.invoiceType || null,
        templateCode: input.templateCode || '1/770',
        invoiceSeries: input.invoiceSeries || 'K23TXM',
        paymentStatus: input.paymentStatus || false,
        cusGetInvoiceRight: input.cusGetInvoiceRight || true,
        //invoiceIssuedDate: input.invoiceIssuedDate || new Date(),
        transactionUuid: input.transactionUuid || order.orderCode,
        // default information for SInvoice
        adjustmentType: input.adjustmentType || null,
        description: input.description || order.note || null,
      };

      this.logger.log(
        `[MKT-SINVOICE HOOK] Populated data for SInvoice from Order: ${input.mktOrderId}`,
      );

      return {
        ...payload,
        data: updatedInput as unknown as MktSInvoiceWorkspaceEntity,
      };
    } catch (error) {
      this.logger.error(
        `[MKT-SINVOICE HOOK] Failed to populate data for SInvoice from Order: ${input.mktOrderId}`,
        error,
      );

      // still create record with original data if there is an error
      return payload;
    }
  }

  /**
   * convert number to words (simple for VND)
   */
  private numberToWords(amount: number): string {
    // simple implementation - can be improved later
    const units = ['', 'nghìn', 'triệu', 'tỷ'];
    const ones = [
      '',
      'một',
      'hai',
      'ba',
      'bốn',
      'năm',
      'sáu',
      'bảy',
      'tám',
      'chín',
    ];
    const tens = [
      '',
      'mười',
      'hai mươi',
      'ba mươi',
      'bốn mươi',
      'năm mươi',
      'sáu mươi',
      'bảy mươi',
      'tám mươi',
      'chín mươi',
    ];

    if (amount === 0) return 'không đồng';

    let result = '';
    let unitIndex = 0;

    while (amount > 0) {
      const chunk = amount % 1000;

      if (chunk > 0) {
        let chunkText = '';
        const hundred = Math.floor(chunk / 100);
        const ten = Math.floor((chunk % 100) / 10);
        const one = chunk % 10;

        if (hundred > 0) {
          chunkText += ones[hundred] + ' trăm ';
        }

        if (ten > 0) {
          if (ten === 1 && one > 0) {
            chunkText += 'mười ' + ones[one] + ' ';
          } else {
            chunkText += tens[ten] + ' ';
            if (one > 0) {
              chunkText += ones[one] + ' ';
            }
          }
        } else if (one > 0) {
          chunkText += ones[one] + ' ';
        }

        chunkText += units[unitIndex] + ' ';
        result = chunkText + result;
      }
      amount = Math.floor(amount / 1000);
      unitIndex++;
    }

    return result.trim() + ' đồng';
  }

  /**
   * create SInvoice Items from OrderItems
   * GraphQL will automatically set the mktSInvoiceId relationship when using the create syntax
   */
  private async createSInvoiceItemsFromOrderItems(
    orderItems: MktOrderItemWorkspaceEntity[],
    itemInfo: any[],
  ): Promise<any[]> {
    return await orderItems.map((orderItem, index) => {
      const item = itemInfo[index];

      return {
        name:
          orderItem.name ||
          orderItem.snapshotProductName ||
          `Item ${index + 1}`,
        lineNumber: item.lineNumber,
        selection: item.selection || 1,
        itemCode: orderItem.mktProductId
          ? `MKT_${orderItem.mktProductId}`
          : null,
        itemName:
          orderItem.name ||
          orderItem.snapshotProductName ||
          `Item ${index + 1}`,
        unitName: orderItem.unitName || 'unit',
        quantity: orderItem.quantity || 1,
        unitPrice: orderItem.unitPrice || 0,
        itemTotalAmountWithoutTax: item.itemTotalAmountWithoutTax,
        itemTotalAmountAfterDiscount:
          item.itemTotalAmountAfterDiscount || item.itemTotalAmountWithoutTax,
        itemTotalAmountWithTax: item.itemTotalAmountWithTax,
        taxPercentage: orderItem.taxPercentage || 0,
        taxAmount: item.taxAmount,
        discount: 0, // can be get from orderItem if exists
        itemDiscount: 0,
        itemNote: null,
        isIncreaseItem: false,
        position: index + 1,
      };
    });
  }
}
