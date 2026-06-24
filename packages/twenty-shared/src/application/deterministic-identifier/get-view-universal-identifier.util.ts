import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';
import { ViewKey } from '@/types/ViewKey';

// A view is identified by its name within its object.
export const getViewUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  name,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${name}`,
    applicationUniversalIdentifier,
  });

// The INDEX view is an object's singleton main table view; its name is
// server-generated, so it is keyed by the stable INDEX view key.
export const getIndexViewUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${ViewKey.INDEX}`,
    applicationUniversalIdentifier,
  });

// A fields-widget view is 1:1 with its FIELDS page-layout widget, so it is keyed
// by that widget's deterministic universalIdentifier (its name is server-generated).
export const getFieldsWidgetViewUniversalIdentifier = ({
  applicationUniversalIdentifier,
  pageLayoutWidgetUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  pageLayoutWidgetUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: pageLayoutWidgetUniversalIdentifier,
    applicationUniversalIdentifier,
  });
