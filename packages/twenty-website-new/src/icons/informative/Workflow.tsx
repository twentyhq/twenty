type WorkflowIconProps = { size: number; color: string };

export function WorkflowIcon({ size, color }: WorkflowIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
      <path
        d="M6.5 5.5L10.5 8L6.5 10.5V5.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
