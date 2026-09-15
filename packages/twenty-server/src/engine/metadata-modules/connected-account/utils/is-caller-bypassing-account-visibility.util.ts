import { type WorkspaceAuthContextType } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const isCallerBypassingAccountVisibility = (
  callerType?: WorkspaceAuthContextType,
): boolean => {
  switch (callerType) {
    case 'application':
    case 'system':
      return true;
    default:
      return false;
  }
};
