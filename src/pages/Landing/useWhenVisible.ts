import { useEffect, useRef } from "react";

export const useWhenVisible = (callback: () => void) => {
  const refDom = useRef(null);

  useEffect(() => {
    let observer: IntersectionObserver;

    if (refDom.current) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              // when image is visible in the viewport + rootMargin
              if (entry.intersectionRatio > 0 || entry.isIntersecting) {
                callback();
                if (refDom.current) observer.unobserve(refDom.current);
              }
            });
          },
          {
            threshold: 0.01,
            /* rootMargin: "75%", */
          }
        );

        observer.observe(refDom.current);
      } else {
        // Old browsers fallback
        callback();
      }
    }

    return () => {
      // on component unmount, we remove the listner
      if (observer && observer.unobserve) {
        if (refDom.current) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          observer.unobserve(refDom.current);
        }
      }
    };
  }, [callback]);

  return { refDom };
};
