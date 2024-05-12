import IConfig from "./IConfig";
// import butterflyConfig from './butterfly';
// import butterConfig from './butter';
// import gygConfig from './gyg';
// import airmilesConfig from './airmiles';
import { staticLocalConfig } from "./local";

const initialStaticLocalConfig: IConfig = staticLocalConfig;
// const env = process.env.REACT_APP_ENV?.trim();
// if (env === 'butterfly') config = butterflyConfig;
// else if (env === 'butter') config = butterConfig;
// else if (env === 'gyg') config = gygConfig;
// else if (env === 'airmiles') config = airmilesConfig;
// else

declare global {
  interface Window {
    twindow: {
      map?: google.maps.Map;
      planBounds?: google.maps.LatLngBounds | null;
      cityBounds?: google.maps.LatLngBounds | null;
      meMarker?: google.maps.Marker;
      config?: any;
      langCode?: string;
    };
    google?: any;
    googleTranslateElementInit?: () => void;
    tconfig: IConfig;
  }
}
window.twindow = window.twindow || {};
window.tconfig = window.tconfig || initialStaticLocalConfig;
