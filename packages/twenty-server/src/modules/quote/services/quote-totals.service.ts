import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

// Fee type enum values as stored in the DB
const FEE_TYPE_FIXED = 'FIXED_PRICE';
const FEE_TYPE_TM = 'TIME_AND_MATERIALS';

type LineItemRow = {
  feeType: string;
  fixedFeeAmountAmountMicros: string | null;
  fixedFeeAmountCurrencyCode: string | null;
  hourlyRateAmountMicros: string | null;
  hourlyRateCurrencyCode: string | null;
  estimatedHours: number | null;
  quoteSectionId: string;
};

@Injectable()
export class QuoteTotalsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // Recompute the estimatedLineAmount for the given line item, then roll up
  // the parent section subtotal and the grandparent quote totalAmount.
  async recomputeFromLineItem(
    workspaceId: string,
    lineItemId: string,
  ): Promise<void> {
    const schema = getWorkspaceSchemaName(workspaceId);

    const rows: LineItemRow[] = await this.dataSource.query(
      `SELECT
         "feeType",
         "fixedFeeAmountAmountMicros",
         "fixedFeeAmountCurrencyCode",
         "hourlyRateAmountMicros",
         "hourlyRateCurrencyCode",
         "estimatedHours",
         "quoteSectionId"
       FROM ${schema}."_lineItem"
       WHERE "id" = $1 AND "deletedAt" IS NULL`,
      [lineItemId],
    );

    // If the item was hard-deleted or not found we still need to roll up,
    // so we proceed with the section ID sourced from elsewhere.  If we have
    // a row we also update estimatedLineAmount on the item itself.
    if (rows.length > 0) {
      const row = rows[0];
      const { amountMicros, currencyCode } =
        this.computeLineAmount(row);

      await this.dataSource.query(
        `UPDATE ${schema}."_lineItem"
         SET "estimatedLineAmountAmountMicros" = $1,
             "estimatedLineAmountCurrencyCode" = $2
         WHERE "id" = $3`,
        [amountMicros, currencyCode, lineItemId],
      );

      await this.recomputeSectionSubtotal(schema, row.quoteSectionId);
    }
  }

  // Called when a line item's section context is available (e.g. after delete
  // where the item is already soft-deleted and won't appear in the query above).
  async recomputeFromSectionId(
    workspaceId: string,
    quoteSectionId: string,
  ): Promise<void> {
    const schema = getWorkspaceSchemaName(workspaceId);

    await this.recomputeSectionSubtotal(schema, quoteSectionId);
  }

  // Recompute the quote totalAmount given a quoteTerm whose affectsFees may
  // have changed (or which may have just been created/deleted).
  async recomputeFromTerm(
    workspaceId: string,
    term: {
      owningSectionQuotationQuoteSectionId: string | null;
    },
  ): Promise<void> {
    const schema = getWorkspaceSchemaName(workspaceId);

    const quoteId = await this.resolveQuoteIdFromTerm(schema, term);

    if (quoteId) {
      await this.recomputeQuoteTotal(schema, quoteId);
    }
  }

  // Exposed for direct use by the quote-term post-query hook when the quote ID
  // has already been resolved.
  async recomputeQuoteTotal(schema: string, quoteId: string): Promise<void> {
    // Sum section subtotals (non-deleted sections only).
    const baseTotalRows: Array<{ base: string }> = await this.dataSource.query(
      `SELECT COALESCE(SUM("subtotalAmountMicros"), 0)::text AS base
       FROM ${schema}."_quoteSection"
       WHERE "quoteId" = $1 AND "deletedAt" IS NULL`,
      [quoteId],
    );

    const baseMicros = BigInt(baseTotalRows[0]?.base ?? '0');

    // Sum fee percentages from terms that affect fees and belong to this quote
    // (either directly or via a child section).
    const pctRows: Array<{ pct: string }> = await this.dataSource.query(
      `SELECT COALESCE(SUM("feePercentage"), 0)::text AS pct
       FROM ${schema}."_quoteTerm"
       WHERE "affectsFees" = true
         AND "deletedAt" IS NULL
         AND "owningSectionQuotationQuoteSectionId" IN (
           SELECT "id"
           FROM ${schema}."_quoteSection"
           WHERE "quoteId" = $1 AND "deletedAt" IS NULL
         )`,
      [quoteId],
    );

    const feePercentage = parseFloat(pctRows[0]?.pct ?? '0');

    // totalAmount = baseTotal * (1 + feePercentage / 100)
    const totalMicros =
      feePercentage === 0
        ? baseMicros
        : BigInt(
            Math.round(Number(baseMicros) * (1 + feePercentage / 100)),
          );

    // Carry forward the existing currency code — do not overwrite it.
    await this.dataSource.query(
      `UPDATE ${schema}."_quote"
       SET "totalAmountAmountMicros" = $1
       WHERE "id" = $2`,
      [totalMicros.toString(), quoteId],
    );
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private computeLineAmount(row: LineItemRow): {
    amountMicros: string;
    currencyCode: string;
  } {
    if (row.feeType === FEE_TYPE_FIXED) {
      return {
        amountMicros: row.fixedFeeAmountAmountMicros ?? '0',
        currencyCode: row.fixedFeeAmountCurrencyCode ?? '',
      };
    }

    if (row.feeType === FEE_TYPE_TM) {
      const rate = BigInt(row.hourlyRateAmountMicros ?? '0');
      const hours = BigInt(Math.round((row.estimatedHours ?? 0) * 1e6));
      // rate is already in micros; multiply by hours then divide by 1e6
      const amountMicros = (rate * hours) / BigInt(1_000_000);

      return {
        amountMicros: amountMicros.toString(),
        currencyCode: row.hourlyRateCurrencyCode ?? '',
      };
    }

    return { amountMicros: '0', currencyCode: '' };
  }

  private async recomputeSectionSubtotal(
    schema: string,
    quoteSectionId: string,
  ): Promise<void> {
    // Sum only non-deleted line items for this section.
    const subtotalRows: Array<{ subtotal: string; currencyCode: string }> =
      await this.dataSource.query(
        `SELECT
           COALESCE(SUM("estimatedLineAmountAmountMicros"), 0)::text AS subtotal,
           MAX("estimatedLineAmountCurrencyCode") AS "currencyCode"
         FROM ${schema}."_lineItem"
         WHERE "quoteSectionId" = $1 AND "deletedAt" IS NULL`,
        [quoteSectionId],
      );

    const subtotalMicros = subtotalRows[0]?.subtotal ?? '0';
    const currencyCode = subtotalRows[0]?.currencyCode ?? '';

    await this.dataSource.query(
      `UPDATE ${schema}."_quoteSection"
       SET "subtotalAmountMicros" = $1,
           "subtotalCurrencyCode" = $2
       WHERE "id" = $3`,
      [subtotalMicros, currencyCode, quoteSectionId],
    );

    // Walk up to the quote.
    const sectionRows: Array<{ quoteId: string }> =
      await this.dataSource.query(
        `SELECT "quoteId" FROM ${schema}."_quoteSection" WHERE "id" = $1`,
        [quoteSectionId],
      );

    if (sectionRows.length > 0) {
      await this.recomputeQuoteTotal(schema, sectionRows[0].quoteId);
    }
  }

  private async resolveQuoteIdFromTerm(
    schema: string,
    term: {
      owningSectionQuotationQuoteSectionId: string | null;
    },
  ): Promise<string | null> {
    if (term.owningSectionQuotationQuoteSectionId) {
      const rows: Array<{ quoteId: string }> = await this.dataSource.query(
        `SELECT "quoteId" FROM ${schema}."_quoteSection" WHERE "id" = $1`,
        [term.owningSectionQuotationQuoteSectionId],
      );

      return rows[0]?.quoteId ?? null;
    }

    return null;
  }
}
