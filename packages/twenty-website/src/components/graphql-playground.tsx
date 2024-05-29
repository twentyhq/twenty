'use client';
import React, { useEffect, useState } from 'react';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import { Theme, useTheme } from '@graphiql/react';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';

import { SubDoc } from '@/components/token-form';

import Playground from './playground';

// import explorerCss from '!css-loader!@graphiql/plugin-explorer/dist/style.css';
// import graphiqlCss from '!css-loader!graphiql/graphiql.css';

const SubDocToPath = {
  core: 'graphql',
  metadata: 'metadata',
};

// Docusaurus does SSR for custom pages, but we need to load GraphiQL in the browser
const GraphQlComponent = ({ token, baseUrl, path }) => {
  const explorer = explorerPlugin({
    showAttribution: true,
  });

  const fetcher = createGraphiQLFetcher({
    url: baseUrl + '/' + path,
  });

  // We load graphiql style using useEffect as it breaks remaining docs style
  useEffect(() => {
    const createAndAppendStyle = (css) => {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = css.toString();
      document.head.append(styleElement);
      return styleElement;
    };

    // const styleElement1 = createAndAppendStyle(graphiqlCss);
    // const styleElement2 = createAndAppendStyle(explorerCss);

    return () => {
      // styleElement1.remove();
      // styleElement2.remove();
    };
  }, []);

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

    const handleThemeChange = (ev) => {
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
    <Playground
      children={children}
      setToken={setToken}
      setBaseUrl={setBaseUrl}
      subDoc={subDoc}
    />
  );
};
export default GraphQlPlayground;
