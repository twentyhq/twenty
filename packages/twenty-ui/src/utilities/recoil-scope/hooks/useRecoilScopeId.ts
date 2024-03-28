import { useContext } from 'react';

import { RecoilScopeContextType } from 'src/utilities/recoil-scope/states/RecoilScopeContextType';

/**
 * @deprecated Use a custom scope instead and desctructure the scope id from the scope context
 */
export const useRecoilScopeId = (
  RecoilScopeContext: RecoilScopeContextType,
) => {
  const recoilScopeId = useContext(RecoilScopeContext);

  if (!recoilScopeId)
    throw new Error(
      `Using useRecoilScopeId outside of the specified context : ${RecoilScopeContext.displayName}, verify that you are using a RecoilScope with the specific context you want to use.`,
    );

  return recoilScopeId;
};
