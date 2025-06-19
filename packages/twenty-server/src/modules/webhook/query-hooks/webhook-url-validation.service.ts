import { Injectable } from '@nestjs/common';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';

@Injectable()
export class WebhookUrlValidationService {
  validateWebhookUrl(targetUrl: string): void {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      throw new GraphqlQueryRunnerException(
        `Invalid URL: missing scheme. URLs must include http:// or https://. Received: ${targetUrl}`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new GraphqlQueryRunnerException(
        `Invalid URL scheme. Only HTTP and HTTPS are allowed. Received: ${parsedUrl.protocol}`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
