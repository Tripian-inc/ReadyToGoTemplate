import IUserState from './IUserState';
import ITripState from './ITripState';
import IFocusState from './IFocusState';

import ILayoutState from './ILayoutState';
import IGmapState from './IGmapState';

interface ICombinedState {
  user: IUserState;
  trip: ITripState;
  focus: IFocusState;

  gmap: IGmapState;
  layout: ILayoutState;
}

export default ICombinedState;
