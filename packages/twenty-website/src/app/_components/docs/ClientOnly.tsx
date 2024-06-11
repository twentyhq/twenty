import dynamic from 'next/dynamic';

type ClientOnlyProps = { children: any };

const ClientOnly = (props: ClientOnlyProps) => {
  const { children } = props;

  return children;
};

export default dynamic(() => Promise.resolve(ClientOnly), {
  ssr: false,
});
