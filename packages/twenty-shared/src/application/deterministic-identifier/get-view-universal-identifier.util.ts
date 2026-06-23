import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';
import { ViewKey } from '@/types/ViewKey';

// A view is identified by its name within its object.
export const getViewUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
  name,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${name}`,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });

// The INDEX view is an object's singleton main table view; its name is
// server-generated, so it is keyed by the stable INDEX view key.
export const getIndexViewUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${ViewKey.INDEX}`,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });

// A fields-widget view is 1:1 with its FIELDS page-layout widget, so it is keyed
// by that widget's deterministic universalIdentifier (its name is server-generated).
export const getFieldsWidgetViewUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  pageLayoutWidgetUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  pageLayoutWidgetUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: pageLayoutWidgetUniversalIdentifier,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
