import { Injectable } from '@nestjs/common';

import { ValidationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Injectable()
export class PdfMimeValidatorService {
  private readonly PDF_MIME_TYPES = ['application/pdf'];

  validate(mimeType: string): void {
    if (!this.PDF_MIME_TYPES.includes(mimeType)) {
      throw new ValidationError(
        'Only PDF files are allowed for this field. Please upload a file with MIME type: application/pdf',
      );
    }
  }

  isValid(mimeType: string): boolean {
    return this.PDF_MIME_TYPES.includes(mimeType);
  }

  getSupportedMimeTypes(): string[] {
    return [...this.PDF_MIME_TYPES];
  }
}
