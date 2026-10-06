import { CREDIT_TOP_UP_INVOICE_KIND } from 'src/engine/core-modules/billing/constants/credit-top-up-invoice-kind.constant';

export type MockStripeCreditTopUpInvoicePaidData = {
  object: {
    id: string;
    object: 'invoice';
    customer: string;
    number: string | null;
    amount_paid: number;
    metadata: Record<string, string>;
  };
};

export const createMockStripeCreditTopUpInvoicePaidData = ({
  workspaceId,
  creditAmountMicro,
  stripeCustomerId = 'cus_default0',
  invoiceId = 'in_test_credit_top_up',
  invoiceNumber = 'TEST-0001',
  amountPaid = 1000,
}: {
  workspaceId: string;
  creditAmountMicro: number;
  stripeCustomerId?: string;
  invoiceId?: string;
  invoiceNumber?: string | null;
  amountPaid?: number;
}): MockStripeCreditTopUpInvoicePaidData => ({
  object: {
    id: invoiceId,
    object: 'invoice',
    customer: stripeCustomerId,
    number: invoiceNumber,
    amount_paid: amountPaid,
    metadata: {
      kind: CREDIT_TOP_UP_INVOICE_KIND,
      workspaceId,
      creditAmountMicro: String(creditAmountMicro),
    },
  },
});
