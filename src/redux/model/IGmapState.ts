import Model from '@tripian/model';
import { RouteResult } from '@tripian/react';

interface IGmapState {
  centerState: Model.Coordinate;
  zoomState: number;
  boundryState: number[];
  legs: RouteResult.ILeg[];
}

export default IGmapState;
