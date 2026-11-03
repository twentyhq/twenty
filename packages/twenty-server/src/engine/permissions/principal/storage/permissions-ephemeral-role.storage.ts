/* @license Enterprise */

import { AsyncLocalStorage } from 'async_hooks';

import { isDefined } from 'twenty-shared/utils';

import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { isSamePermissionsActor } from 'src/engine/permissions/principal/utils/is-same-permissions-actor.util';

type PermissionsEphemeralRoleBinding = {
  authContext: PermissionsAuthContext;
  ephemeralRole: PermissionScope;
};

const permissionsEphemeralRoleStorage =
  new AsyncLocalStorage<PermissionsEphemeralRoleBinding>();

export const withPermissionsEphemeralRole = <T>(
  binding: PermissionsEphemeralRoleBinding | undefined,
  fn: () => T | Promise<T>,
): T | Promise<T> =>
  isDefined(binding) ? permissionsEphemeralRoleStorage.run(binding, fn) : fn();

// Only the actor the role was bound to is narrowed, so checks on other members are untouched
export const findPermissionsEphemeralRole = (
  authContext: PermissionsAuthContext,
): PermissionScope | undefined => {
  const binding = permissionsEphemeralRoleStorage.getStore();

  return isDefined(binding) &&
    isSamePermissionsActor(binding.authContext, authContext)
    ? binding.ephemeralRole
    : undefined;
};
