import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';

import { type RecordGqlFieldsRelationWithArguments } from '../../types/RecordGqlFieldsRelationWithArguments';
import { sortKeysDeeply } from '../sortKeysDeeply';

const RESPONSE_KEY_HASH_LENGTH = 16;

// Derived from the field and its arguments alone, so the query and the readers of its result agree on the key without sharing state
export const computeRelationWithArgumentsResponseKey = ({
  relationFieldName,
  filter,
  orderBy,
  first,
}: Pick<
  RecordGqlFieldsRelationWithArguments,
  'relationFieldName' | 'filter' | 'orderBy' | 'first'
>): string => {
  const serializedArguments = JSON.stringify(
    sortKeysDeeply({ filter, first, orderBy }),
  );

  const argumentsHash = bytesToHex(
    sha256(utf8ToBytes(serializedArguments)),
  ).slice(0, RESPONSE_KEY_HASH_LENGTH);

  return `${relationFieldName}_${argumentsHash}`;
};
