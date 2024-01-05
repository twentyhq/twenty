'use client';

import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import dynamic from 'next/dynamic';

import 'graphiql/graphiql.css';

// Create a named function for your component
function GraphiQLComponent() {
  const fetcher = createGraphiQLFetcher({
    url: 'https://api.twenty.com/graphql',
  });

  return <GraphiQL fetcher={fetcher} />;
}

// Dynamically import the GraphiQL component with SSR disabled
const GraphiQLWithNoSSR = dynamic(() => Promise.resolve(GraphiQLComponent), {
  ssr: false,
});

const GraphQLDocs = () => {
  return <GraphiQLWithNoSSR />;
};

export default GraphQLDocs;
