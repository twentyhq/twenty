import { type CoreEditorHeaderProps } from './types/CoreEditorHeaderProps';
import styles from './CodeEditorHeader.module.scss';

export const CoreEditorHeader = ({
  title,
  leftNodes,
  rightNodes,
}: CoreEditorHeaderProps) => {
  return (
    <div className={styles.editorHeader}>
      <div className={styles.elementContainer}>
        {leftNodes &&
          leftNodes.map((leftButton, index) => {
            return <div key={`left-${index}`}>{leftButton}</div>;
          })}
        {title}
      </div>
      <div className={styles.elementContainer}>
        {rightNodes &&
          rightNodes.map((rightButton, index) => {
            return <div key={`right-${index}`}>{rightButton}</div>;
          })}
      </div>
    </div>
  );
};
