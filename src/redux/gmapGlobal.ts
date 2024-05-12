const setGmapCenter = (center: google.maps.LatLng | google.maps.LatLngLiteral) => window.twindow.map?.panTo(center);

const setGmapZoom = (zoom: number) => window.twindow.map?.setZoom(zoom);

const setGmapBounds = (bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral, padding?: number | google.maps.Padding | undefined) =>
  window.twindow.map?.fitBounds(bounds, padding);

const setGmapZoomFocus = () => (window.twindow.map?.getZoom() ?? 0) < 15 && setGmapZoom(15);

const panToPlan = () => {
  if (window.twindow.map && window.twindow.planBounds) window.twindow.map.fitBounds(window.twindow.planBounds);
  else if (window.twindow.map && window.twindow.cityBounds) window.twindow.map.fitBounds(window.twindow.cityBounds);
};

const showMeMarker = () => {
  const setMeMarker = (mePosition: google.maps.LatLngLiteral) => {
    if (!window.twindow.meMarker) {
      window.twindow.meMarker = new google.maps.Marker({
        icon: { url: "https://s3-eu-west-1.amazonaws.com/poi-pics/Icon/locator18.png", size: new google.maps.Size(18, 18) },
        position: mePosition,
      });
    }
    window.twindow.meMarker?.setMap(window.twindow.map || null);
  };

  if (window.navigator.geolocation) {
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        const mePosition: google.maps.LatLngLiteral = { lat: position.coords.latitude, lng: position.coords.longitude };
        setMeMarker(mePosition);
        setGmapCenter(mePosition);
      },
      () => {
        // eslint-disable-next-line no-console
        console.error("Position error");
      }
    );
  }
};

const hideMeMarker = () => {
  if (window.twindow.meMarker) {
    window.twindow.meMarker?.setMap(null);
  }
  panToPlan();
};

const gmapGlobal = {
  setGmapCenter,
  setGmapZoom,
  setGmapBounds,
  setGmapZoomFocus,
  showMeMarker,
  hideMeMarker,
  panToPlan,
};

export default gmapGlobal;
