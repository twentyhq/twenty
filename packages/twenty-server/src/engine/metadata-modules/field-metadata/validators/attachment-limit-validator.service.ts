import { Injectable } from '@nestjs/common';

import { ValidationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Injectable()
export class AttachmentLimitValidatorService {
  private readonly MAX_ATTACHMENTS = 10;

  validate(attachmentIds: string[]): void {
    if (!attachmentIds) {
      return;
    }

    if (!Array.isArray(attachmentIds)) {
      throw new ValidationError('attachmentIds must be an array');
    }

    if (attachmentIds.length > this.MAX_ATTACHMENTS) {
      throw new ValidationError(
        `PDF/IMAGE fields support maximum ${this.MAX_ATTACHMENTS} attachments. Current count: ${attachmentIds.length}`,
      );
    }
  }

  isValid(attachmentIds: string[]): boolean {
    if (!attachmentIds || !Array.isArray(attachmentIds)) {
      return false;
    }

    return attachmentIds.length <= this.MAX_ATTACHMENTS;
  }

  getMaxAttachments(): number {
    return this.MAX_ATTACHMENTS;
  }
}
