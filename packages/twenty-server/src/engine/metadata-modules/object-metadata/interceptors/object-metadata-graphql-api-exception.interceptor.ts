import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type Observable, catchError } from 'rxjs';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { objectMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/object-metadata/utils/object-metadata-graphql-api-exception-handler.util';

@Injectable()
export class ObjectMetadataGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  constructor(private readonly i18nService: I18nService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();
    const locale = ctx.req?.locale ?? SOURCE_LOCALE;
    const i18n = this.i18nService.getI18nInstance(locale);

    return next
      .handle()
      .pipe(
        catchError((err) =>
          objectMetadataGraphqlApiExceptionHandler(err, i18n),
        ),
      );
  }
}
