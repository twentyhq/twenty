'use client';
import dynamic from 'next/dynamic';

const GraphQlPlayground = dynamic(
  () => import('@/app/_components/playground/graphql-playground'),
  { ssr: false },
);

const MetadataGraphql = () => {
  return <GraphQlPlayground subDoc={'metadata'} />;
};

export default MetadataGraphql;
