import { type CSSProperties } from 'react';

import styles from './ResizeHandle.module.scss';

type ResizeHandleProps = {
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLDivElement>) => void;
  style?: CSSProperties;
};

export const ResizeHandle = ({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  style,
}: ResizeHandleProps) => (
  <div
    className={styles.area}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    style={style}
  >
    <div className={styles.bar} />
  </div>
);
