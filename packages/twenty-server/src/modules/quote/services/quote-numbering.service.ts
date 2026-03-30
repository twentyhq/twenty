import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Injectable()
export class QuoteNumberingService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // Returns the next available quote number for this workspace and the
  // auto-generated display name for the quote.
  async assignNextNumber(workspaceId: string): Promise<{
    quoteNumber: number;
    name: string;
  }> {
    const schema = getWorkspaceSchemaName(workspaceId);

    const rows: Array<{ max: string | null }> = await this.dataSource.query(
      `SELECT MAX("quoteNumber")::text AS max
       FROM ${schema}."_quote"
       WHERE "deletedAt" IS NULL`,
    );

    const quoteNumber = parseInt(rows[0]?.max ?? '0', 10) + 1;
    const name = this.formatQuoteName(quoteNumber, 1);

    return { quoteNumber, name };
  }

  formatQuoteName(quoteNumber: number, version: number): string {
    const paddedNumber = String(quoteNumber).padStart(4, '0');

    return `Q-${paddedNumber} v${version}`;
  }
}
