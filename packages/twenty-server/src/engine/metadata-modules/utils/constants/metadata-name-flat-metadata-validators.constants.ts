import { msg } from '@lingui/core/macro';
import camelCase from 'lodash.camelcase';
import { RESERVED_METADATA_NAME_KEYWORDS } from 'twenty-shared/metadata';

import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';
import {
  beneathDatabaseIdentifierMinimumLength,
  exceedsDatabaseIdentifierMaximumLength,
} from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';

const STARTS_WITH_LOWER_CASE_AND_CONTAINS_ONLY_CAPS_AND_LOWER_LETTERS_AND_NUMBER_STRING_REGEX =
  /^[a-z][a-zA-Z0-9]*$/;

export const METADATA_NAME_VALIDATORS: FlatMetadataValidator<string>[] = [
  {
    message: msg`Name is too long`,
    validator: (name) => exceedsDatabaseIdentifierMaximumLength(name),
  },
  {
    message: msg`Name is too short`,
    validator: (name) => beneathDatabaseIdentifierMinimumLength(name),
  },
  {
    message: msg`Name should be in camelCase`,
    validator: (name) => name !== camelCase(name),
  },
  {
    message: msg`Name is not valid: it must start with lowercase letter and contain only alphanumeric letters`,
    validator: (name) =>
      !name.match(
        STARTS_WITH_LOWER_CASE_AND_CONTAINS_ONLY_CAPS_AND_LOWER_LETTERS_AND_NUMBER_STRING_REGEX,
      ),
  },
  {
    // Safety net: Catch any reserved keywords that bypass frontend sanitization
    // (e.g., programmatic API access, old clients)
    // Frontend auto-adds "Custom" suffix, so properly formed requests will pass
    message: msg`This name is reserved. Use a different name or the system will add "Custom" suffix.`,
    validator: (name) => RESERVED_METADATA_NAME_KEYWORDS.includes(name),
  },
];
