import { Context, useContext } from 'react';

/**
 * @deprecated use a custom scope instead and desctructure the scope id from the scope context
 * Get the scope context with useScopeInternalContext
 */
export const useContextScopeId = (SpecificContext: Context<string | null>) => {
  const recoilScopeId = useContext(SpecificContext);

  if (!recoilScopeId)
    throw new Error(
      `Using useContextScopedId outside of the specified context : ${SpecificContext.displayName}, verify that you are using a RecoilScope with the specific context you want to use.`,
    );

  return recoilScopeId;
};
