type LightbulbIconProps = {
  size: number;
  color: string;
  strokeWidth?: number;
};

export function LightbulbIcon({
  size,
  color,
  strokeWidth = 1.5,
}: LightbulbIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 11.5v1c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-1M8 1.5a4 4 0 0 0-2.5 7.1c.5.4.8 1 .8 1.7v.2h3.4v-.2c0-.7.3-1.3.8-1.7A4 4 0 0 0 8 1.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
