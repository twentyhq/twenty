import { useRecoilScopedStateV2 } from '../../../../utilities/recoil-scope/hooks/useRecoilScopedStateV2';
import { useAvailableScopeIdOrThrow } from '../../../../utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { SnackBarManagerScopeInternalContext } from '../../scopes/scope-internal-context/SnackBarManagerScopeInternalContext';
import { snackBarInternalScopedState } from '../../states/snackBarInternalScopedState';

type useSnackBarManagerScopedStatesProps = {
  snackBarManagerScopeId?: string;
};

export const useSnackBarManagerScopedStates = (
  props?: useSnackBarManagerScopedStatesProps,
) => {
  const scopeId = useAvailableScopeIdOrThrow(
    SnackBarManagerScopeInternalContext,
    props?.snackBarManagerScopeId,
  );

  const [snackBarInternal, setSnackBarInternal] = useRecoilScopedStateV2(
    snackBarInternalScopedState,
    scopeId,
  );

  return { snackBarInternal, setSnackBarInternal };
};
