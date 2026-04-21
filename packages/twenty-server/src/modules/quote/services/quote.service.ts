import { Injectable } from '@nestjs/common';

import { QuoteStatus } from 'src/modules/quote/standard-objects/quote.workspace-entity';

export interface CreateQuoteDto {
  name: string;
  opportunityId?: string;
  validUntil?: Date;
  notes?: string;
  lineItems: Array<{
    name: string;
    description?: string;
    productId?: string;
    quantity: number;
    unitPrice?: number;
    discount?: number;
  }>;
}

export interface UpdateQuoteDto
  extends Partial<Omit<CreateQuoteDto, 'lineItems'>> {
  status?: QuoteStatus;
  lineItems?: Array<{
    id?: string;
    name: string;
    description?: string;
    productId?: string;
    quantity: number;
    unitPrice?: number;
    discount?: number;
  }>;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  header: string;
  footer: string;
  terms: string;
  isActive: boolean;
}

export interface QuoteCalculation {
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
  margin: number;
}

export interface DiscountApprovalRequest {
  quoteId: string;
  requestedDiscount: number;
  discountType: 'percentage' | 'fixed';
  reason: string;
  requestedBy: string;
}

export interface ApprovalWorkflow {
  id: string;
  ruleName: string;
  conditions: Array<{
    field: string;
    operator: 'greater_than' | 'less_than' | 'equals';
    value: number;
  }>;
  requiredApprovals: Array<{
    role: string;
    level: number;
  }>;
}

@Injectable()
export class QuoteService {
  private approvalRequests: Map<string, DiscountApprovalRequest> = new Map();
  private approvalWorkflows: ApprovalWorkflow[] = [
    {
      id: 'workflow_1',
      ruleName: 'Standard Discount',
      conditions: [
        { field: 'discountPercentage', operator: 'less_than', value: 10 },
      ],
      requiredApprovals: [{ role: 'sales_manager', level: 1 }],
    },
    {
      id: 'workflow_2',
      ruleName: 'High Discount',
      conditions: [
        { field: 'discountPercentage', operator: 'greater_than', value: 10 },
        { field: 'totalAmount', operator: 'less_than', value: 10000 },
      ],
      requiredApprovals: [
        { role: 'sales_manager', level: 1 },
        { role: 'regional_manager', level: 2 },
      ],
    },
    {
      id: 'workflow_3',
      ruleName: 'Enterprise Deal',
      conditions: [
        { field: 'totalAmount', operator: 'greater_than', value: 10000 },
      ],
      requiredApprovals: [
        { role: 'sales_manager', level: 1 },
        { role: 'regional_manager', level: 2 },
        { role: 'vp_sales', level: 3 },
      ],
    },
  ];

  async createQuote(workspaceId: string, input: QuoteInput) {
    const calculation = this.calculateQuote(input.lineItems);

    return {
      id: `quote_${Date.now()}`,
      accountId: input.accountId,
      opportunityId: input.opportunityId,
      validUntil: input.validUntil,
      paymentTerms: input.paymentTerms ?? 'Net 30',
      notes: input.notes,
      lineItems: input.lineItems.map((item) => ({
        ...item,
        discount: item.discount ?? 0,
        discountType: item.discountType ?? 'percentage',
        taxRate: item.taxRate ?? 0,
      })),
      ...calculation,
      status: 'draft',
      version: 1,
      createdAt: new Date().toISOString(),
    };
  }

  calculateQuote(lineItems: QuoteInput['lineItems']): QuoteCalculation {
    let subtotal = 0;
    let discountTotal = 0;
    let taxAmount = 0;

    const processedItems = lineItems.map((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const discount = item.discount ?? 0;
      const discountAmount =
        item.discountType === 'percentage'
          ? itemSubtotal * (discount / 100)
          : discount;
      const afterDiscount = itemSubtotal - discountAmount;
      const tax = afterDiscount * ((item.taxRate ?? 0) / 100);

      subtotal += itemSubtotal;
      discountTotal += discountAmount;
      taxAmount += tax;

      return {
        ...item,
        subtotal: itemSubtotal,
        discountAmount,
        afterDiscount,
        tax,
        total: afterDiscount + tax,
      };
    });

    const taxableAmount = subtotal - discountTotal;
    const total = taxableAmount + taxAmount;

    return {
      subtotal,
      discountTotal,
      taxableAmount,
      taxAmount,
      total,
      margin: 0,
    };
  }

  async updateQuote(
    workspaceId: string,
    quoteId: string,
    updates: Partial<QuoteInput>,
  ) {
    return {
      id: quoteId,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: 2,
    };
  }

  async sendQuote(workspaceId: string, quoteId: string) {
    return {
      quoteId,
      status: 'sent',
      sentAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async acceptQuote(workspaceId: string, quoteId: string) {
    return {
      quoteId,
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
    };
  }

  async rejectQuote(workspaceId: string, quoteId: string, reason: string) {
    return {
      quoteId,
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: new Date().toISOString(),
    };
  }

  async requestDiscountApproval(
    workspaceId: string,
    request: DiscountApprovalRequest,
  ) {
    const requestId = `approval_${Date.now()}`;
    const approvalRequest = {
      ...request,
      id: requestId,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    this.approvalRequests.set(requestId, approvalRequest);

    const workflow = this.findApprovalWorkflow(request);

    return {
      requestId,
      ...approvalRequest,
      workflow: workflow ? workflow.ruleName : 'No approval needed',
      requiredApprovers: workflow?.requiredApprovals ?? [],
    };
  }

  private findApprovalWorkflow(
    request: DiscountApprovalRequest,
  ): ApprovalWorkflow | undefined {
    return this.approvalWorkflows.find((workflow) => {
      const discountPercentage =
        request.discountType === 'percentage' ? request.requestedDiscount : 0;

      return workflow.conditions.every((condition) => {
        switch (condition.operator) {
          case 'greater_than':
            return discountPercentage > condition.value;
          case 'less_than':
            return discountPercentage < condition.value;
          case 'equals':
            return discountPercentage === condition.value;
          default:
            return false;
        }
      });
    });
  }

  async approveDiscount(
    workspaceId: string,
    requestId: string,
    approverId: string,
    approved: boolean,
    comments?: string,
  ) {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    return {
      requestId,
      status: approved ? 'approved' : 'rejected',
      approverId,
      comments,
      processedAt: new Date().toISOString(),
    };
  }

  async getApprovalStatus(workspaceId: string, requestId: string) {
    return this.approvalRequests.get(requestId) ?? { error: 'Not found' };
  }

  async cloneQuote(workspaceId: string, quoteId: string) {
    return {
      id: `quote_${Date.now()}`,
      originalQuoteId: quoteId,
      status: 'draft',
      version: 1,
      clonedAt: new Date().toISOString(),
    };
  }

  async generatePDF(workspaceId: string, quoteId: string) {
    return {
      quoteId,
      pdfUrl: `/api/quotes/${quoteId}/pdf`,
      generatedAt: new Date().toISOString(),
    };
  }

  async calculateCommission(
    workspaceId: string,
    quoteId: string,
    params: {
      revenue: number;
      productType: string;
      repId: string;
      tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    },
  ) {
    const { revenue, productType, tier } = params;

    const tierRates: Record<string, number> = {
      bronze: 0.05,
      silver: 0.07,
      gold: 0.1,
      platinum: 0.12,
    };

    const productMultipliers: Record<string, number> = {
      new_business: 1.0,
      renewal: 0.5,
      expansion: 1.25,
      upsell: 1.15,
    };

    const baseRate = tierRates[tier] ?? 0.05;
    const multiplier = productMultipliers[productType] ?? 1.0;
    const commission = revenue * baseRate * multiplier;

    return {
      quoteId,
      revenue,
      tier,
      productType,
      baseRate: baseRate * 100,
      multiplier,
      commission,
      currency: 'USD',
      calculatedAt: new Date().toISOString(),
    };
  }
}
