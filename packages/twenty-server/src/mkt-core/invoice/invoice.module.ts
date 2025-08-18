import { MiddlewareConsumer,Module,RequestMethod } from '@nestjs/common';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { InvoiceMiddleware } from './middleware/invoice-middleware';
import { InvoiceHookService } from './services/invoice-hook.service';

@Module({ 
  imports: [
    JwtModule, // import JwtModule to use JwtService
  ],
  providers: [
    InvoiceHookService,
  ],
  exports: [
    InvoiceHookService,
  ],
})
export class InvoiceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InvoiceMiddleware) // comment out InvoiceMiddleware for now
      .forRoutes({ path: '/graphql', method: RequestMethod.POST });
  }
}
