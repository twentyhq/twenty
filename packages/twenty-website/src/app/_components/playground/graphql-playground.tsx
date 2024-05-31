'use client';
import React, { useEffect, useState } from 'react';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import { Theme, useTheme } from '@graphiql/react';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';

import { SubDoc } from '@/app/_components/playground/token-form';

import Playground from './playground';

const SubDocToPath = {
  core: 'graphql',
  metadata: 'metadata',
};

const GraphQlComponent = ({ token, baseUrl, path }: any) => {
  const explorer = explorerPlugin({
    showAttribution: true,
  });

  const fetcher = createGraphiQLFetcher({
    url: baseUrl + '/' + path,
  });

  if (!baseUrl || !token) {
    return <></>;
  }

  return (
    <div className="fullHeightPlayground">
      <GraphiQL
        plugins={[explorer]}
        fetcher={fetcher}
        defaultHeaders={JSON.stringify({ Authorization: `Bearer ${token}` })}
      />
    </div>
  );
};

const GraphQlPlayground = ({ subDoc }: { subDoc: SubDoc }) => {
  const [token, setToken] = useState<string>();
  const [baseUrl, setBaseUrl] = useState<string>();
  const { setTheme } = useTheme();

  useEffect(() => {
    window.localStorage.setItem(
      'graphiql:theme',
      window.localStorage.getItem('theme') || 'light',
    );

    const handleThemeChange = (ev: any) => {
      if (ev.key === 'theme') {
        setTheme(ev.newValue as Theme);
      }
    };

    window.addEventListener('storage', handleThemeChange);

    return () => window.removeEventListener('storage', handleThemeChange);
  }, []);

  const children = (
    <GraphQlComponent
      token={token}
      baseUrl={baseUrl}
      path={SubDocToPath[subDoc]}
    />
  );

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Playground
        children={children}
        setToken={setToken}
        setBaseUrl={setBaseUrl}
        subDoc={subDoc}
      />
    </div>
  );
};
export default GraphQlPlayground;
