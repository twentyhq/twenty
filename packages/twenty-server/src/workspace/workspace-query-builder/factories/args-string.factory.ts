import { Injectable } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

import { stringifyWithoutKeyQuote } from 'src/workspace/workspace-query-builder/utils/stringify-without-key-quote.util';

import { ArgsAliasFactory } from './args-alias.factory';

@Injectable()
export class ArgsStringFactory {
  constructor(private readonly argsAliasFactory: ArgsAliasFactory) {}

  create(
    initialArgs: Record<string, any> | undefined,
    fieldMetadataCollection: FieldMetadataInterface[],
  ): string | null {
    if (!initialArgs) {
      return null;
    }
    let argsString = '';
    const computedArgs = this.argsAliasFactory.create(
      initialArgs,
      fieldMetadataCollection,
    );

    for (const key in computedArgs) {
      // Check if the value is not undefined
      if (computedArgs[key] === undefined) {
        continue;
      }

      if (typeof computedArgs[key] === 'string') {
        // If it's a string, add quotes
        argsString += `${key}: "${computedArgs[key]}", `;
      } else if (
        typeof computedArgs[key] === 'object' &&
        computedArgs[key] !== null
      ) {
        // If it's an object (and not null), stringify it
        argsString += `${key}: ${stringifyWithoutKeyQuote(
          computedArgs[key],
        )}, `;
      } else {
        // For other types (number, boolean), add as is
        argsString += `${key}: ${computedArgs[key]}, `;
      }
    }

    // Remove trailing comma and space, if present
    if (argsString.endsWith(', ')) {
      argsString = argsString.slice(0, -2);
    }

    return argsString;
  }
}
