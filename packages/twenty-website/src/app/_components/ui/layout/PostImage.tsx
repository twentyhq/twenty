import Image from 'next/image';

export const PostImage = ({
  sources,
  style,
}: {
  sources: { light: string; dark: string };
  style?: React.CSSProperties;
}) => {
  return <Image src={sources.light} style={style} alt={sources.light} />;
};
