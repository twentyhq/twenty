'use client';
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';

import { SubDoc } from '@/app/_components/playground/token-form';

import Playground from './playground';

import 'graphiql/graphiql.css';
import '@graphiql/plugin-explorer/dist/style.css';

const StyledContainer = styled.div`
  height: 100%;
`;

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
    <StyledContainer>
      <GraphiQL
        plugins={[explorer]}
        fetcher={fetcher}
        defaultHeaders={JSON.stringify({ Authorization: `Bearer ${token}` })}
      />
    </StyledContainer>
  );
};

const GraphQlPlayground = ({ subDoc }: { subDoc: SubDoc }) => {
  const [token, setToken] = useState<string>();
  const [baseUrl, setBaseUrl] = useState<string>();

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
