import { msg } from '@lingui/core/macro';
import camelCase from 'lodash.camelcase';
import { RESERVED_METADATA_NAME_KEYWORDS } from 'twenty-shared/metadata';

import { type FlatMetadataValidator } from 'src/engine/metadata-modules/types/flat-metadata-validator.type';
import {
  beneathDatabaseIdentifierMinimumLength,
  exceedsDatabaseIdentifierMaximumLength,
} from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';
import { STARTS_WITH_LOWER_CASE_AND_CONTAINS_ONLY_CAPS_AND_LOWER_LETTERS_AND_NUMBER_STRING_REGEX } from 'src/engine/metadata-modules/utils/validate-metadata-name-start-with-lowercase-letter-and-contain-digits-nor-letters.utils';

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
    message: msg`The name is not available`,
    validator: (name) => RESERVED_METADATA_NAME_KEYWORDS.includes(name),
  },
];
