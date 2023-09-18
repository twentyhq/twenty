import { IEdge } from './edge.interface';
import { IPageInfo } from './page-info.interface';

export interface IConnection<T, CustomEdge extends IEdge<T> = IEdge<T>> {
  edges: Array<CustomEdge>;
  pageInfo: IPageInfo;
  totalCount: number;
}
