import { Module } from '@nestjs/common';

import { QuoteCreateOnePreQueryHook } from 'src/modules/quote/query-hooks/quote-create-one.pre-query.hook';
import { QuoteUpdateOnePreQueryHook } from 'src/modules/quote/query-hooks/quote-update-one.pre-query.hook';
import {
  QuoteLineItemCreateOnePreQueryHook,
  QuoteLineItemUpdateOnePreQueryHook,
} from 'src/modules/quote/query-hooks/quote-line-item-mutate.pre-query.hook';
import {
  QuoteLineItemCreateOnePostQueryHook,
  QuoteLineItemUpdateOnePostQueryHook,
  QuoteLineItemDeleteOnePostQueryHook,
} from 'src/modules/quote/query-hooks/quote-line-item-mutate.post-query.hook';
import {
  QuoteTermCreateOnePostQueryHook,
  QuoteTermUpdateOnePostQueryHook,
  QuoteTermDeleteOnePostQueryHook,
} from 'src/modules/quote/query-hooks/quote-term-mutate.post-query.hook';
import { QuoteTotalsService } from 'src/modules/quote/services/quote-totals.service';
import { QuoteNumberingService } from 'src/modules/quote/services/quote-numbering.service';

@Module({
  providers: [
    // Services
    QuoteTotalsService,
    QuoteNumberingService,
    // Quote hooks
    QuoteCreateOnePreQueryHook,
    QuoteUpdateOnePreQueryHook,
    // Line item hooks
    QuoteLineItemCreateOnePreQueryHook,
    QuoteLineItemUpdateOnePreQueryHook,
    QuoteLineItemCreateOnePostQueryHook,
    QuoteLineItemUpdateOnePostQueryHook,
    QuoteLineItemDeleteOnePostQueryHook,
    // Term hooks
    QuoteTermCreateOnePostQueryHook,
    QuoteTermUpdateOnePostQueryHook,
    QuoteTermDeleteOnePostQueryHook,
  ],
})
export class QuoteQueryHookModule {}
