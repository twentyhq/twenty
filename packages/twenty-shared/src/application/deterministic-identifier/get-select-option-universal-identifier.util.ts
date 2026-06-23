import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// An option is identified by its stable value (not its renameable label) within its field.
export const getSelectOptionUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  fieldUniversalIdentifier,
  value,
}: {
  ownerApplicationUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  value: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'selectOption',
    value: `${fieldUniversalIdentifier}:${value}`,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
