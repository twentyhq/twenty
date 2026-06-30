import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A view field group is identified by its name within its view.
export const getViewFieldGroupUniversalIdentifier = ({
  applicationUniversalIdentifier,
  viewUniversalIdentifier,
  name,
}: {
  applicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'viewFieldGroup',
    value: `${viewUniversalIdentifier}:${name}`,
    applicationUniversalIdentifier,
  });
