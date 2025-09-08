import { Injectable } from '@nestjs/common';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SInvoiceIntegrationService } from 'src/mkt-core/invoice/s-invoice.integration.service';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order-item.workspace-entity';

type sInvoiceType = {
  id?: string;
  name?: string;
  amount?: string;
  status?: string;
  vat?: number;
  totalAmount?: number;
  sInvoiceCode?: string;
  sentAt?: string;
  supplierTaxCode?: string | null;
  invoiceType?: string;
  templateCode?: string;
  invoiceSeries?: string;
  invoiceNo?: string;
  transactionUuid?: string;
  issueDate?: string;
  totalWithoutTax?: number;
  totalTax?: number;
  totalWithTax?: number;
  taxInWords?: string;
  mktOrderId?: string;
};

@Injectable()
export class MktInvoiceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly sInvoiceIntegrationService: SInvoiceIntegrationService,
  ) {}

  async customizeGraphQLRequest(
    operationName: string,
    variables: { input: sInvoiceType },
  ): Promise<void> {
    if (!variables || !variables.input) {
      return;
    }
    if (operationName === 'CreateOneMktInvoice') {
      await this.customizeMktInvoiceRequest(variables.input);
    }
  }

  async customizeMktInvoiceRequest(input: sInvoiceType): Promise<void> {
    if (input.name === '' || !input.name) {
      if (input.mktOrderId) {
        input.name = await this.generateInvoiceNameFromOrder(input.mktOrderId);
        const sInvoice: sInvoiceType =
          await this.sInvoiceIntegrationService.createInvoiceForOrder(
            input.mktOrderId,
          );

        Object.assign(input, sInvoice);
      }
    }
  }

  private async generateInvoiceNameFromOrder(orderId: string): Promise<string> {
    try {
      const orderItemName =
        await this.updateInvoiceNameFromOrderItemDirectly(orderId);

      if (!orderItemName) {
        return this.generateInvoiceName(orderId);
      }
      const timestamp = new Date().toISOString().split('T')[0];

      const maxLength = 50;
      const truncatedName =
        orderItemName.length > maxLength
          ? orderItemName.substring(0, maxLength) + '...'
          : orderItemName;

      const result = `INV-${truncatedName}-${timestamp}`;

      return result;
    } catch (error) {
      return this.generateInvoiceName(orderId);
    }
  }

  private generateInvoiceName(orderId: string): string {
    const orderSuffix = orderId.slice(0, 8);
    const timestamp = new Date().toISOString().split('T')[0];

    return `INV-${orderSuffix}-${timestamp}`;
  }

  async updateInvoiceNameFromOrderItemDirectly(
    mktOrderId: string,
  ): Promise<string | null> {
    try {
      const orderItemNames = await this.getAllOrderItemNames(mktOrderId);

      return orderItemNames;
    } catch (error) {
      console.error(`MktInvoiceService: Error getting orderItem names:`, error);

      return null;
    }
  }

  private async getAllOrderItemNames(
    mktOrderId: string,
  ): Promise<string | null> {
    try {
      const workspaceId =
        this.scopedWorkspaceContextFactory.create().workspaceId;

      if (!workspaceId) {
        throw new Error(
          'No workspace id found from ScopedWorkspaceContextFactory',
        );
      }

      const orderItemRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          MktOrderItemWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const orderItems = await orderItemRepository.find({
        where: {
          mktOrderId: mktOrderId,
          deletedAt: null as any,
        },
        select: ['name'],
      });

      if (!orderItems || orderItems.length === 0) {
        console.log(`No orderItems found for order ${mktOrderId}`);

        return null;
      }

      const orderItemNames = orderItems
        .filter((item: any) => item.name)
        .map((item: any) => item.name)
        .filter(
          (name: string, index: number, arr: string[]) =>
            arr.indexOf(name) === index,
        );

      if (orderItemNames.length === 0) {
        console.log(`No valid orderItem names found for order ${mktOrderId}`);

        return null;
      }

      const result = orderItemNames.join(' ');

      return result;
    } catch (error) {
      console.error('Error getting orderItem names:', error);

      return null;
    }
  }
}
