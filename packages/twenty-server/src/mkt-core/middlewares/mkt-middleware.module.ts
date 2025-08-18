import { MiddlewareConsumer,Module,RequestMethod } from '@nestjs/common';
import { InvoiceModule } from 'src/mkt-core/invoice/invoice.module';
import { GraphQLRequestCustomMiddleware } from 'src/mkt-core/middlewares/graphql-request-custom.middleware';
import { GraphQLRequestCustomService } from 'src/mkt-core/middlewares/graphql-request-custom.service';
import { MktOrderModule } from 'src/mkt-core/order/mkt-order.module';

@Module({
  imports: [
    InvoiceModule,
    MktOrderModule,
  ],
  providers: [
    GraphQLRequestCustomMiddleware,
    GraphQLRequestCustomService,
  ],
  exports: [
    GraphQLRequestCustomService
  ],
})
export class MktMiddlewareModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(GraphQLRequestCustomMiddleware)
      .forRoutes({ path: 'graphql', method: RequestMethod.ALL });
  }
}
