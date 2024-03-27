import { ReactNode } from 'react';

import { TabListScopeInternalContext } from './scope-internal-context/TabListScopeInternalContext';

type TabListScopeProps = {
  children: ReactNode;
  tabListScopeId: string;
};

export const TabListScope = ({
  children,
  tabListScopeId,
}: TabListScopeProps) => {
  return (
    <TabListScopeInternalContext.Provider value={{ scopeId: tabListScopeId }}>
      {children}
    </TabListScopeInternalContext.Provider>
  );
};
