const MENU_PATH = 'M.5.5H14M.5 5.75H14M.5 11H14';

interface MenuIconProps {
  size: number;
  strokeColor: string;
}

export function MenuIcon({ size, strokeColor }: MenuIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14.5 11.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={MENU_PATH}
        stroke={strokeColor}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
