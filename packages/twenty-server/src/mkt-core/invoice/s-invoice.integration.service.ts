import { Injectable, Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import axios, { AxiosInstance } from 'axios';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MKT_INVOICE_STATUS } from 'src/mkt-core/invoice/objects/mkt-invoice.workspace-entity';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order-item.workspace-entity';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';

type CreateInvoiceResponse = {
  transactionUuid?: string;
  invoiceNo?: string;
  message?: string;
  [key: string]: any;
  result: any;
};

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
export class SInvoiceIntegrationService {
  private readonly logger = new Logger(SInvoiceIntegrationService.name);
  private readonly http: AxiosInstance;

  private readonly baseUrl =
    process.env.S_INVOICE_BASE_URL || 'https://api-vinvoice.viettel.vn';
  private readonly taxCode = process.env.S_INVOICE_TAX_CODE || '0100109106-507';
  private readonly templateCode =
    process.env.S_INVOICE_TEMPLATE_CODE || '1/770';
  private readonly invoiceSeries = process.env.S_INVOICE_SERIES || 'K23TXM';
  private readonly username =
    process.env.S_INVOICE_USERNAME || '0100109106-507';
  private readonly password = process.env.S_INVOICE_PASSWORD || '123456';
  private readonly cookieToken = process.env.S_INVOICE_COOKIE || '';

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {
    this.http = axios.create({ baseURL: this.baseUrl, timeout: 30000 });
  }

  /**
   * Auto-generate e-invoice on S-Invoice when an order becomes PAID
   */
  async createInvoiceForOrder(orderId: string): Promise<sInvoiceType> {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      this.logger.error('Workspace ID not found when creating S-Invoice');

      return {} as sInvoiceType;
    }
    let sInvoice: sInvoiceType = {} as sInvoiceType;
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

    const order = await orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      this.logger.warn(`Order ${orderId} not found when creating S-Invoice`);

      return {} as sInvoiceType;
    }

    const items = await orderItemRepository.find({
      where: { mktOrderId: orderId } as any,
    });

    if (!items || items.length === 0) {
      this.logger.warn(
        `Order ${orderId} has no items; skip S-Invoice creation`,
      );

      return {} as sInvoiceType;
    }

    const nowMs = Date.now();
    const transactionUuid = randomUUID();

    // Build item lines
    const itemInfo = items.map((it, idx) => {
      const quantity = it.quantity ?? 1;
      const unitPrice = it.unitPrice ?? 0;
      const amountWithoutTax = unitPrice * quantity;
      const taxPercent = (it.taxPercentage ?? 0) as number;
      const taxAmount = Math.round((amountWithoutTax * taxPercent) / 100);
      const withTax = amountWithoutTax + taxAmount;

      return {
        lineNumber: idx + 1,
        selection: 1,
        itemName: it.name || it.snapshotProductName || `Item ${idx + 1}`,
        unitName: it.unitName || 'unit',
        quantity,
        unitPrice,
        itemTotalAmountWithoutTax: amountWithoutTax,
        itemTotalAmountAfterDiscount: amountWithoutTax,
        itemTotalAmountWithTax: withTax,
        taxPercentage: taxPercent,
        taxAmount,
      };
    });

    // Compute tax breakdowns (group by taxPercentage)
    const taxMap = new Map<
      number,
      { taxableAmount: number; taxAmount: number }
    >();

    for (const line of itemInfo) {
      const key = line.taxPercentage || 0;
      const current = taxMap.get(key) || { taxableAmount: 0, taxAmount: 0 };

      current.taxableAmount += line.itemTotalAmountWithoutTax;
      current.taxAmount += line.taxAmount;
      taxMap.set(key, current);
    }
    const taxBreakdowns = Array.from(taxMap.entries()).map(
      ([taxPercentage, v]) => ({
        taxPercentage,
        taxableAmount: v.taxableAmount,
        taxAmount: v.taxAmount,
      }),
    );

    const totalAmountWithoutTax = itemInfo.reduce(
      (s, l) => s + l.itemTotalAmountWithoutTax,
      0,
    );
    const totalTaxAmount = itemInfo.reduce((s, l) => s + l.taxAmount, 0);
    const totalAmountWithTax = totalAmountWithoutTax + totalTaxAmount;

    const payload = {
      generalInvoiceInfo: {
        invoiceType: '1',
        templateCode: this.templateCode,
        invoiceSeries: this.invoiceSeries,
        currencyCode: 'VND',
        exchangeRate: 1,
        adjustmentType: '1',
        paymentStatus: true,
        cusGetInvoiceRight: true,
        invoiceIssuedDate: nowMs,
        transactionUuid,
      },
      buyerInfo: {
        buyerName: order.name || 'Khách hàng',
        buyerLegalName: null,
        buyerTaxCode: null,
        buyerAddressLine: '',
        buyerPhoneNumber: null,
        buyerEmail: null,
        buyerIdNo: null,
        buyerIdType: null,
        buyerNotGetInvoice: '0',
      },
      payments: [{ paymentMethodName: 'Tiền mặt' }],
      itemInfo,
      taxBreakdowns,
      summarizeInfo: {
        sumOfTotalLineAmountWithoutTax: totalAmountWithoutTax,
        totalAmountAfterDiscount: totalAmountWithTax,
        totalAmountWithoutTax,
        totalTaxAmount,
        totalAmountWithTax,
        totalAmountWithTaxInWords: null,
        discountAmount: 0,
      },
      metadata: [
        {
          keyTag: 'invoiceNote',
          stringValue: `Auto generated for order ${orderId}`,
          valueType: 'text',
          keyLabel: 'Ghi chú',
        },
      ],
    };

    try {
      // Create Basic Auth header
      const basicAuth = Buffer.from(
        `${this.username}:${this.password}`,
      ).toString('base64');

      this.logger.log(
        `[S-INVOICE] Using Basic Auth with username: ${this.username}`,
      );
      this.logger.log(`[S-INVOICE] Basic Auth header: Basic ${basicAuth}`);

      // Set headers with Basic Auth and Cookie
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
        Cookie: this.cookieToken,
      };

      const url = `/services/einvoiceapplication/api/InvoiceAPI/InvoiceWS/createInvoice/${this.taxCode}`;

      this.logger.log(
        `[S-INVOICE] Creating invoice with URL: ${this.baseUrl}${url}`,
      );
      this.logger.log(
        `[S-INVOICE] Request headers: ${JSON.stringify(headers)}`,
      );
      this.logger.log(
        `[S-INVOICE] Invoice payload: ${JSON.stringify(payload)}`,
      );

      const res = await this.http.post<CreateInvoiceResponse>(url, payload, {
        headers,
      });

      const response = res.data.result || {};

      this.logger.log(`[S-INVOICE] Response: ${JSON.stringify(response)}`);
      sInvoice = {
        status: MKT_INVOICE_STATUS.SENT,
        amount: String(totalAmountWithTax),
        vat: totalTaxAmount,
        totalWithoutTax: totalAmountWithoutTax,
        totalTax: totalTaxAmount,
        totalWithTax: totalAmountWithTax,
        sInvoiceCode: this.taxCode,
        supplierTaxCode: this.taxCode,
        templateCode: this.templateCode,
        invoiceSeries: this.invoiceSeries,
        invoiceNo: response.invoiceNo,
        transactionUuid: response.transactionUuid || transactionUuid,
        issueDate: String(nowMs),
      };
    } catch (error: any) {
      const errMsg = error?.response?.data || error?.message;

      this.logger.error(
        `Create S-Invoice failed for order ${orderId}: ${JSON.stringify(errMsg)}`,
      );
      // Persist a draft/error invoice for traceability
      try {
        sInvoice = {
          status: MKT_INVOICE_STATUS.DRAFT,
          amount: String(totalAmountWithTax),
          vat: totalTaxAmount,
          totalWithoutTax: totalAmountWithoutTax,
          totalTax: totalTaxAmount,
          totalWithTax: totalAmountWithTax,
          sInvoiceCode: this.taxCode,
          supplierTaxCode: this.taxCode,
          templateCode: this.templateCode,
          invoiceSeries: this.invoiceSeries,
          transactionUuid,
          issueDate: String(nowMs),
        };
      } catch (persistErr) {
        this.logger.error(
          `Failed to save draft invoice after API error: ${persistErr?.message}`,
        );
      }
    }

    return sInvoice;
  }
}
