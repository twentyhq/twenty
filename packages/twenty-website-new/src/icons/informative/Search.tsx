type SearchIconProps = { size: number; color: string };

export function SearchIcon({ size, color }: SearchIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="7" cy="7" r="5" stroke={color} strokeWidth="1.5" />
      <path
        d="M11 11L14 14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
