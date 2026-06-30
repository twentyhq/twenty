import { pascalCase } from '../strings/pascalCase';

export const getNodeTypename = (name: string): string => pascalCase(name);

export const getConnectionTypename = (objectNameSingular: string): string =>
  `${pascalCase(objectNameSingular)}Connection`;

export const getEdgeTypename = (objectNameSingular: string): string =>
  `${pascalCase(objectNameSingular)}Edge`;

export const getGroupByConnectionTypename = (
  objectNameSingular: string,
): string => `${pascalCase(objectNameSingular)}GroupByConnection`;
