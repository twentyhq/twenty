import { Injectable } from '@nestjs/common';

import { ValidationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Injectable()
export class ImageMimeValidatorService {
  private readonly IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  validate(mimeType: string): void {
    if (!this.isValid(mimeType)) {
      throw new ValidationError(
        `Only image files are allowed for this field. Supported formats: ${this.IMAGE_MIME_TYPES.join(', ')}`,
      );
    }
  }

  isValid(mimeType: string): boolean {
    return this.IMAGE_MIME_TYPES.some((type) => mimeType.startsWith(type));
  }

  getSupportedMimeTypes(): string[] {
    return [...this.IMAGE_MIME_TYPES];
  }
}
