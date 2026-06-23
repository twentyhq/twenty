import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';
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
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.view,
    value: `${objectUniversalIdentifier}:${name}`,
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
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.view,
    value: `${objectUniversalIdentifier}:${ViewKey.INDEX}`,
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
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.view,
    value: pageLayoutWidgetUniversalIdentifier,
  });
