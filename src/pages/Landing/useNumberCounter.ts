import { useCallback, useState } from "react";

export const useNumberCounter = (max: number, counterSecond = 2, times = 20) => {
  const [timerA, setTimerA] = useState<NodeJS.Timeout>();
  const [count, setCount] = useState(0);

  const runCounter = useCallback(() => {
    const countriesPeriod = (counterSecond * 1000) / times;
    const aplus = Math.floor(max / times);

    const runA = () => {
      if (count < max) {
        setCount((prev) => {
          if (prev + aplus < max) {
            const a = setTimeout(runA, countriesPeriod);
            setTimerA(a);
            return prev + aplus;
          } else {
            return max;
          }
        });
      }
    };

    if (timerA === undefined) {
      const a = setTimeout(runA, countriesPeriod);
      setTimerA(a);
    }
  }, [count, counterSecond, max, timerA, times]);

  return { count, runCounter };
};
