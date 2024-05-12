export const pageview = (url: string) => {
  // Route changes tracking with url
  gtag("config", window.tconfig.GOOGLE_ANALYTICS_KEY || "", { page_path: url });
};

export const googleAnalyticsEvent = (eventName: string, event: object) => {
  // Send custom event to Google Analytics
  // This function used in CIBC
  gtag("event", eventName, event);
};

export const googleAnalyticsDimension = (dimensionName: string, dimensionValue: string | number) => {
  // Sends the custom dimension to Google Analytics.
  // unsused now
  gtag("set", { dimensionName, dimensionValue });
};
