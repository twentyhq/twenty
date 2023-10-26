export type DateScalarMode = 'isoDate' | 'timestamp';
export type NumberScalarMode = 'float' | 'integer';

export interface BuildSchemaOptions {
  /**
   * Date scalar mode
   * @default 'isoDate'
   */
  dateScalarMode?: DateScalarMode;

  /**
   * Number scalar mode
   * @default 'float'
   */
  numberScalarMode?: NumberScalarMode;
}
