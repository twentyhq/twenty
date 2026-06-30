import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// NavigationMenuItem is a single polymorphic entity: every variant shares
// name/icon/color/position/folder, but each type is identified by a different
// target, so each variant has its own discriminator (prefixed by the type to
// keep the shared `navigationMenuItem` namespace collision-free).

// A FOLDER navigation item is identified by its name within its application.
export const getFolderNavigationMenuItemUniversalIdentifier = ({
  applicationUniversalIdentifier,
  name,
}: {
  applicationUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'navigationMenuItem',
    value: `FOLDER:${name}`,
    applicationUniversalIdentifier,
  });

// An OBJECT navigation item is identified by the object it targets.
export const getObjectNavigationMenuItemUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'navigationMenuItem',
    value: `OBJECT:${objectUniversalIdentifier}`,
    applicationUniversalIdentifier,
  });

// A VIEW navigation item is identified by the view it targets.
export const getViewNavigationMenuItemUniversalIdentifier = ({
  applicationUniversalIdentifier,
  viewUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  viewUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'navigationMenuItem',
    value: `VIEW:${viewUniversalIdentifier}`,
    applicationUniversalIdentifier,
  });

// A LINK navigation item is identified by its target URL.
export const getLinkNavigationMenuItemUniversalIdentifier = ({
  applicationUniversalIdentifier,
  link,
}: {
  applicationUniversalIdentifier: string;
  link: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'navigationMenuItem',
    value: `LINK:${link}`,
    applicationUniversalIdentifier,
  });
