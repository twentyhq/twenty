import { Injectable, Logger } from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  CreateInvoiceResponse,
  GetInvoiceFileRequest,
  GetInvoiceFileResponse,
  sInvoicePayload,
  sInvoiceType,
  sInvoiceUpdate,
} from 'src/mkt-core/invoice/invoice.constants';
import { MktSInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice.workspace-entity';
import { SINVOICE_STATUS as ORDER_SINVOICE_STATUS } from 'src/mkt-core/order/constants/order-status.constants';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order.workspace-entity';

@Injectable()
export class SInvoiceIntegrationService {
  private readonly logger = new Logger(SInvoiceIntegrationService.name);
  private readonly http: AxiosInstance;

  private readonly baseUrl =
    process.env.S_INVOICE_BASE_URL || 'https://api-vinvoice.viettel.vn';
  private readonly taxCode = process.env.S_INVOICE_TAX_CODE || '0100109106-507';
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

  public filterSInvoiceToPayload(
    sInvoice: MktSInvoiceWorkspaceEntity,
  ): sInvoicePayload {
    // handle payments
    const payments = sInvoice.mktSInvoicePayments?.map((payment) => ({
      paymentMethodName: payment.paymentMethodName || 'Tiền mặt',
    })) || [{ paymentMethodName: 'Tiền mặt' }];

    // handle itemInfo from mktSInvoiceItems
    const itemInfo =
      sInvoice.mktSInvoiceItems?.map((item) => ({
        lineNumber: item.lineNumber || 1,
        selection: item.selection || 1,
        itemCode: item.itemCode || null,
        itemName: item.itemName || item.name || '',
        unitName: item.unitName || null,
        quantity: item.quantity || null,
        unitPrice: item.unitPrice || null,
        itemTotalAmountWithoutTax: item.itemTotalAmountWithoutTax || null,
        itemTotalAmountAfterDiscount: item.itemTotalAmountAfterDiscount || null,
        itemTotalAmountWithTax: item.itemTotalAmountWithTax || null,
        taxPercentage: item.taxPercentage || null,
        taxAmount: item.taxAmount || null,
        discount: item.discount || null,
        itemDiscount: item.itemDiscount || null,
        itemNote: item.itemNote || null,
        isIncreaseItem: item.isIncreaseItem || null,
      })) || [];

    // handle taxBreakdowns from mktSInvoiceTaxBreakdowns
    const taxBreakdowns =
      sInvoice.mktSInvoiceTaxBreakdowns?.map((tax) => ({
        taxPercentage: tax.taxPercentage || 0,
        taxableAmount: tax.taxableAmount || 0,
        taxAmount: tax.taxAmount || 0,
      })) || [];

    // handle metadata from mktSInvoiceMetadata
    const metadata =
      sInvoice.mktSInvoiceMetadata?.map((meta) => ({
        keyTag: meta.keyTag || '',
        stringValue: meta.stringValue || '',
        valueType: meta.valueType || 'text',
        keyLabel: meta.keyLabel || '',
      })) || [];

    // Convert invoiceIssuedDate to timestamp if it exists
    const invoiceIssuedDate = sInvoice.invoiceIssuedDate
      ? new Date(sInvoice.invoiceIssuedDate).getTime()
      : null;

    return {
      generalInvoiceInfo: {
        invoiceType: sInvoice.invoiceType || '1',
        templateCode: sInvoice.templateCode || '1/770',
        invoiceSeries: sInvoice.invoiceSeries || 'K24GAM',
        currencyCode: (sInvoice.currencyCode as any) || 'VND',
        exchangeRate: sInvoice.exchangeRate
          ? parseFloat(sInvoice.exchangeRate)
          : 1,
        adjustmentType: sInvoice.adjustmentType || '1',
        paymentStatus: sInvoice.paymentStatus || false,
        cusGetInvoiceRight: sInvoice.cusGetInvoiceRight || false,
        invoiceIssuedDate: invoiceIssuedDate,
        transactionUuid: sInvoice.transactionUuid || null,
      },
      buyerInfo: {
        buyerName: sInvoice.buyerName || '',
        buyerLegalName: sInvoice.buyerLegalName || null,
        buyerTaxCode: sInvoice.buyerTaxCode || null,
        buyerAddressLine: sInvoice.buyerAddressLine || '',
        buyerPhoneNumber: sInvoice.buyerPhoneNumber || null,
        buyerEmail: sInvoice.buyerEmail || null,
        buyerIdNo: sInvoice.buyerIdNo || null,
        buyerIdType: sInvoice.buyerIdType || null,
        buyerNotGetInvoice: sInvoice.buyerNotGetInvoice || '0',
      },
      payments,
      itemInfo,
      taxBreakdowns,
      summarizeInfo: {
        sumOfTotalLineAmountWithoutTax:
          sInvoice.sumOfTotalLineAmountWithoutTax || 0,
        totalAmountAfterDiscount: sInvoice.totalAmountAfterDiscount || 0,
        totalAmountWithoutTax: sInvoice.totalAmountWithoutTax || 0,
        totalTaxAmount: sInvoice.totalTaxAmount || 0,
        totalAmountWithTax: sInvoice.totalAmountWithTax || 0,
        totalAmountWithTaxInWords: sInvoice.totalAmountWithTaxInWords || null,
        discountAmount: sInvoice.discountAmount || 0,
      },
      metadata,
    };
  }

  async syncSInvoice(orderId: string) {
    this.logger.log(
      `[S-INVOICE SERVICE] Starting syncSInvoice for order: ${orderId}`,
    );

    try {
      const workspaceId =
        this.scopedWorkspaceContextFactory.create().workspaceId;

      if (!workspaceId) {
        return {} as sInvoiceType;
      }

      const sInvoiceRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoiceWorkspaceEntity>(
          workspaceId,
          'mktSInvoice',
          { shouldBypassPermissionChecks: true },
        );

      const sInvoice = await sInvoiceRepository.findOne({
        where: { mktOrderId: orderId },
        relations: [
          'mktSInvoicePayments',
          'mktSInvoiceItems',
          'mktSInvoiceTaxBreakdowns',
          'mktSInvoiceMetadata',
        ],
      });

      if (!sInvoice) {
        this.logger.warn(
          `[S-INVOICE SERVICE] S-Invoice not found for order ${orderId} when sync S-Invoice`,
        );

        return {} as sInvoiceType;
      }

      const sInvoiceFilter = this.filterSInvoiceToPayload(sInvoice);

      const payload = sInvoiceFilter;
      const sInvoiceUpdate = await this.sendSInvoice(payload, orderId);

      await this.saveSInvoice(sInvoiceUpdate, sInvoice.id);
      this.logger.log(
        `[S-INVOICE SERVICE] Completed syncSInvoice for order: ${orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `[S-INVOICE SERVICE] Failed to sync S-Invoice for order ${orderId}: ${error}`,
      );
      this.logger.error(
        `[S-INVOICE SERVICE] Error details: ${error.message}`,
        error.stack,
      );
    }
  }

  async sendSInvoice(payload: sInvoicePayload, orderId: string) {
    let sInvoiceUpdate = {} as sInvoiceUpdate;

    try {
      // Create Basic Auth header
      const basicAuth = Buffer.from(
        `${this.username}:${this.password}`,
      ).toString('base64');

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
        `[S-INVOICE] Invoice payload: ${JSON.stringify(payload)}`,
      );

      const res = await this.http.post<CreateInvoiceResponse>(url, payload, {
        headers,
      });

      const response = res.data || {};

      sInvoiceUpdate = {
        errorCode: response?.errorCode,
        description: response?.description,
        supplierTaxCode: response?.result?.supplierTaxCode,
        invoiceNo: response?.result?.invoiceNo,
        transactionID: response?.result?.transactionID,
        reservationCode: response?.result?.reservationCode,
        codeOfTax: response?.result?.codeOfTax,
        errorMessage: null,
        errorData: null,
        orderSInvoiceStatus: ORDER_SINVOICE_STATUS.SUCCESS,
      };
      this.logger.log(
        `[S-INVOICE] Response: ${JSON.stringify(sInvoiceUpdate)}`,
      );
    } catch (error: any) {
      const errMsg = error?.response?.data || error?.message;

      this.logger.error(
        `Create S-Invoice failed for order ${orderId}: ${JSON.stringify(errMsg)}`,
      );

      sInvoiceUpdate = {
        errorCode: errMsg?.code,
        errorMessage: errMsg?.message,
        errorData: errMsg?.data,
        orderSInvoiceStatus: ORDER_SINVOICE_STATUS.FAILED,
      };
      this.logger.log(
        `[S-INVOICE] Response: ${JSON.stringify(sInvoiceUpdate)}`,
      );
    } finally {
      return sInvoiceUpdate;
    }
  }

  async saveSInvoice(sInvoiceUpdate: sInvoiceUpdate, sInvoiceId: string) {
    this.logger.log(
      `[S-INVOICE SERVICE] Starting saveSInvoice for ID: ${sInvoiceId}`,
    );

    try {
      const workspaceId =
        this.scopedWorkspaceContextFactory.create().workspaceId;

      if (!workspaceId) {
        this.logger.error('Workspace ID not found when saving S-Invoice');

        return;
      }

      const sInvoiceRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoiceWorkspaceEntity>(
          workspaceId,
          'mktSInvoice',
          { shouldBypassPermissionChecks: true },
        );

      // find existing S-Invoice
      const existingSInvoice = await sInvoiceRepository.findOne({
        where: { id: sInvoiceId },
      });

      if (!existingSInvoice) {
        this.logger.warn(
          `[S-INVOICE SERVICE] S-Invoice with ID ${sInvoiceId} not found`,
        );

        return;
      }

      // update S-Invoice
      const updateData: sInvoiceUpdate = {
        errorCode: sInvoiceUpdate.errorCode,
        description: sInvoiceUpdate.description,
        supplierTaxCode: sInvoiceUpdate.supplierTaxCode,
        invoiceNo: sInvoiceUpdate.invoiceNo,
        transactionID: sInvoiceUpdate.transactionID,
        reservationCode: sInvoiceUpdate.reservationCode,
        codeOfTax: sInvoiceUpdate.codeOfTax,
        errorMessage: sInvoiceUpdate.errorMessage,
        errorData: sInvoiceUpdate.errorData,
      };

      // save update to database
      await sInvoiceRepository.update(
        sInvoiceId,
        updateData as MktSInvoiceWorkspaceEntity,
      );

      // update orderSInvoiceStatus in order table
      if (sInvoiceUpdate.orderSInvoiceStatus && existingSInvoice.mktOrderId) {
        const orderRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktOrderWorkspaceEntity>(
            workspaceId,
            'mktOrder',
            { shouldBypassPermissionChecks: true },
          );

        // Update the order's sInvoiceStatus
        await orderRepository.update(existingSInvoice.mktOrderId, {
          sInvoiceStatus:
            sInvoiceUpdate.orderSInvoiceStatus as ORDER_SINVOICE_STATUS,
        });
        this.logger.log(
          `[S-INVOICE SERVICE] Updated order sInvoiceStatus to ${sInvoiceUpdate.orderSInvoiceStatus} for order ID: ${existingSInvoice.mktOrderId}`,
        );
      }

      this.logger.log(
        `[S-INVOICE SERVICE] Successfully saved S-Invoice with ID: ${sInvoiceId}`,
      );
      this.logger.log(
        `[S-INVOICE SERVICE] Updated data: ${JSON.stringify(updateData)}`,
      );
    } catch (error) {
      this.logger.error(
        `[S-INVOICE SERVICE] Failed to save S-Invoice with ID ${sInvoiceId}: ${error}`,
      );
      this.logger.error(
        `[S-INVOICE SERVICE] Error details: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * get invoice file from API Viettel
   * @param supplierTaxCode Supplier tax code
   * @param invoiceNo Invoice number
   * @param templateCode Template code
   * @param fileType Type of file (PDF)
   * @returns Promise<GetInvoiceFileResponse>
   */
  async getInvoiceFile(
    supplierTaxCode: string,
    invoiceNo: string,
    templateCode: string,
    fileType = 'PDF',
  ): Promise<GetInvoiceFileResponse> {
    this.logger.log(
      `[S-INVOICE SERVICE] Getting invoice file for invoiceNo: ${invoiceNo}`,
    );

    try {
      // Create Basic Auth header
      const basicAuth = Buffer.from(
        `${this.username}:${this.password}`,
      ).toString('base64');

      // Set headers with Basic Auth and Cookie
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
        Cookie: this.cookieToken,
      };
      const url = `/services/einvoiceapplication/api/InvoiceAPI/InvoiceUtilsWS/getInvoiceRepresentationFile`;

      const requestPayload: GetInvoiceFileRequest = {
        supplierTaxCode,
        invoiceNo,
        templateCode,
        fileType,
      };

      this.logger.log(
        `[S-INVOICE SERVICE] Getting invoice file with URL: ${this.baseUrl}${url}`,
      );

      this.logger.log(
        `[S-INVOICE SERVICE] Request payload: ${JSON.stringify(requestPayload)}`,
      );

      const response = await this.http.post<GetInvoiceFileResponse>(
        url,
        requestPayload,
        {
          headers,
        },
      );

      const result = response.data || {};

      this.logger.log(
        `[S-INVOICE SERVICE] Successfully retrieved invoice file for invoiceNo: ${invoiceNo}`,
      );
      this.logger.log(
        `[S-INVOICE SERVICE] Response errorCode: ${result.errorCode}`,
      );

      return result;
    } catch (error: any) {
      const errMsg = error?.response?.data || error?.message;

      this.logger.error(
        `[S-INVOICE SERVICE] Failed to get invoice file for invoiceNo ${invoiceNo}: ${JSON.stringify(errMsg)}`,
      );

      // Return error response
      return {
        errorCode: errMsg?.errorCode || 500,
        description:
          errMsg?.description ||
          errMsg?.message ||
          'Failed to get invoice file',
        fileToBytes: '',
      };
    }
  }

  /**
   * get invoice file from database or API Viettel
   * @param invoiceId Invoice ID
   * @returns Promise<GetInvoiceFileResponse>
   */
  async getInvoiceFileById(invoiceId: string): Promise<GetInvoiceFileResponse> {
    this.logger.log(
      `[S-INVOICE SERVICE] Getting invoice file for invoiceId: ${invoiceId}`,
    );

    try {
      const workspaceId =
        this.scopedWorkspaceContextFactory.create().workspaceId;

      if (!workspaceId) {
        return {
          errorCode: 400,
          description: 'Workspace ID not found',
          fileToBytes: '',
        };
      }

      const sInvoiceRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MktSInvoiceWorkspaceEntity>(
          workspaceId,
          'mktSInvoice',
          { shouldBypassPermissionChecks: true },
        );

      const sInvoice = await sInvoiceRepository.findOne({
        where: { id: invoiceId },
      });

      if (!sInvoice) {
        this.logger.warn(
          `[S-INVOICE SERVICE] S-Invoice not found for ID ${invoiceId}`,
        );

        return {
          errorCode: 404,
          description: 'Invoice not found',
          fileToBytes: '',
        };
      }

      // Check if the required fields are present
      if (
        !sInvoice.supplierTaxCode ||
        !sInvoice.invoiceNo ||
        !sInvoice.templateCode
      ) {
        this.logger.warn(
          `[S-INVOICE SERVICE] Missing required fields for invoice ID ${invoiceId}`,
        );

        return {
          errorCode: 400,
          description: 'Missing required invoice information',
          fileToBytes: '',
        };
      }

      // Call API Viettel to get invoice file
      return await this.getInvoiceFile(
        sInvoice.supplierTaxCode,
        sInvoice.invoiceNo,
        sInvoice.templateCode,
        'PDF',
      );
    } catch (error) {
      this.logger.error(
        `[S-INVOICE SERVICE] Failed to get invoice file for invoiceId ${invoiceId}: ${error}`,
      );
      this.logger.error(
        `[S-INVOICE SERVICE] Error details: ${error.message}`,
        error.stack,
      );

      return {
        errorCode: 500,
        description: 'Internal server error',
        fileToBytes: '',
      };
    }
  }
}
