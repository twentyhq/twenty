import React from 'react';

let themeScopeContext: React.Context<HTMLElement | null> | undefined;

export const getThemeScopeContext = () =>
  (themeScopeContext ??= React.createContext<HTMLElement | null>(null));
