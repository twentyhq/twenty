'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const GraphQlPlayground = dynamic(
  () => import('../../../_components/playground/graphql-playground'),
  { ssr: false },
);

const CoreGraphql = () => {
  return <GraphQlPlayground subDoc={'core'} />;
};

export default CoreGraphql;
