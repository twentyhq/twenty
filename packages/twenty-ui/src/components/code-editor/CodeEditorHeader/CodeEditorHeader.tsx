import { type CodeEditorHeaderProps } from './types/CodeEditorHeaderProps';
import styles from './CodeEditorHeader.module.scss';

export const CodeEditorHeader = ({
  title,
  leftNodes,
  rightNodes,
}: CodeEditorHeaderProps) => {
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
