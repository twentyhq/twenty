const X_PATH =
  'm.03 0 4.83 6.46L0 11.713h1.094L5.35 7.115l3.439 4.598h3.723L7.41 4.89 11.935 0H10.84L6.921 4.235 3.754 0zm1.61.806h1.71l7.553 10.101h-1.71z';

interface XIconProps {
  size: number;
  fillColor: string;
}

export function XIcon({ size, fillColor }: XIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 11.8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={X_PATH} fill={fillColor} />
    </svg>
  );
}
