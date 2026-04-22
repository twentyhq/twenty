'use client';

import { useId } from 'react';

type EditIconProps = { size: number; color: string; strokeWidth?: number };

export function EditIcon({
  size,
  color,
  strokeWidth = 2,
}: EditIconProps) {
  const clipPathId = useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g
        clipPath={`url(#${clipPathId})`}
        stroke={color}
        strokeWidth={strokeWidth}
      >
        <path d="M7.604 3.621c-.744.034-1.476.112-2.19.194-.96.11-1.729.88-1.835 1.84-.104.94-.2 1.911-.2 2.904s.096 1.963.2 2.904c.106.96.875 1.729 1.835 1.839.946.109 1.922.211 2.919.211s1.973-.102 2.92-.211a2.094 2.094 0 0 0 1.834-1.839 35 35 0 0 0 .178-2.032" />
        <path d="M11.916 2.61 8.847 6.09a1.74 1.74 0 0 0-.394.791L8.087 8.6c-.074.349.29.68.63.572l1.724-.542c.287-.09.541-.247.743-.46l3.171-3.336c.578-.608.477-1.625-.222-2.243-.683-.604-1.676-.596-2.217.018Z" />
      </g>
      <defs>
        <clipPath id={clipPathId}>
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
