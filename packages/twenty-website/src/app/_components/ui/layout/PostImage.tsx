export const PostImage = ({
  sources,
  style,
}: {
  sources: { light: string; dark: string };
  style?: React.CSSProperties;
}) => {
  return <img src={sources.light} style={style} alt={sources.light} />;
};
