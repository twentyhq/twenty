import styles from './ButtonText.module.scss';

export const ButtonText = ({
  hasIcon = false,
  isLoading,
  title,
  wrapText = false,
}: {
  isLoading?: boolean;
  hasIcon: boolean;
  title?: string;
  wrapText?: boolean;
}) => {
  return (
    <div className={styles.textWrapper}>
      <div
        className={styles.text}
        data-loading={isLoading || undefined}
        data-has-icon={hasIcon || undefined}
        data-wrap={wrapText || undefined}
      >
        {title}
      </div>
      <div className={styles.ellipsis} data-loading={isLoading || undefined}>
        ...
      </div>
    </div>
  );
};
