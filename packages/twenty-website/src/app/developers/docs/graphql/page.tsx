'use client';

import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import 'graphiql/graphiql.css';

const DeveloperDocs = () => {
  const fetcher = createGraphiQLFetcher({
    url: 'https://api.twenty.com/graphql',
  });

  return <GraphiQL fetcher={fetcher} />;
};

export default DeveloperDocs;
