import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';

import { type RecordGqlFieldsRelationWithArguments } from '../../types/RecordGqlFieldsRelationWithArguments';
import { sortKeysDeeply } from '../sortKeysDeeply';

const RESPONSE_KEY_HASH_LENGTH = 16;

// Derived from the whole entry, so the query and its readers agree on the key without sharing state, and two entries share a key only when they select the same thing
export const computeRelationWithArgumentsResponseKey = ({
  relationFieldName,
  ...relationArgumentsAndSelection
}: RecordGqlFieldsRelationWithArguments): string => {
  const serializedArgumentsAndSelection = JSON.stringify(
    sortKeysDeeply(relationArgumentsAndSelection),
  );

  const hash = bytesToHex(
    sha256(utf8ToBytes(serializedArgumentsAndSelection)),
  ).slice(0, RESPONSE_KEY_HASH_LENGTH);

  return `${relationFieldName}_${hash}`;
};
