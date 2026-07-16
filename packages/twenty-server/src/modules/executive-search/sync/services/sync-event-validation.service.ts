import { Injectable } from '@nestjs/common';
import Ajv, { type ValidateFunction } from 'ajv';

import schema from '../event-envelope/external-sync-event.schema.json';

import {
  SUPPORTED_EVENT_VERSION,
  ALL_KNOWN_EVENT_TYPES,
} from '../event-envelope/external-sync-event.constants';
import type {
  ExternalSyncEvent,
  ExternalSyncEventValidationResult,
} from '../event-envelope/external-sync-event.types';

@Injectable()
export class SyncEventValidationService {
  private readonly validateFn: ValidateFunction;

  constructor() {
    const ajv = new Ajv({ allErrors: true, validateSchema: false });
    this.validateFn = ajv.compile(schema);
  }

  validate(raw: unknown): ExternalSyncEventValidationResult {
    const valid = this.validateFn(raw);

    if (!valid) {
      return {
        success: false,
        errors: this.validateFn.errors?.map((e) => e.message ?? '') ?? [],
      };
    }

    const event = raw as ExternalSyncEvent;

    if (event.eventVersion !== SUPPORTED_EVENT_VERSION) {
      return {
        success: false,
        errors: ['Unsupported event version'],
      };
    }

    if (
      !(ALL_KNOWN_EVENT_TYPES as readonly string[]).includes(event.eventType)
    ) {
      return {
        success: false,
        errors: ['Unknown event type'],
      };
    }

    return { success: true, event };
  }
}
