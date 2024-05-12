import React, { useState } from "react";
import { api } from "@tripian/core";
import exportPng from "./export.png";
import classes from "./PlanRoute.module.scss";
import { PreLoading } from "@tripian/react";

interface IPlanRoute {
  planId: number;
  tripHash: string;
}

const PlanRoute: React.FC<IPlanRoute> = ({ planId, tripHash }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const onChange = () => {
    setLoading(true);
    api.planRouteUrl(planId, tripHash).then((data) => {
      // if (data.url) window.open(data.url, "_blank");
      const a = document.createElement("a");
      a.setAttribute("href", data.url);
      a.setAttribute("target", "_top");
      a.click();
      setLoading(false);
    });
  };

  return (
    <div className={classes.planRoute}>
      <div role="button" className={classes.planRouteButton} tabIndex={0} onKeyDown={() => {}} onClick={onChange}>
        {loading ? <PreLoading color="#000" size="small" /> : <img src={exportPng} alt="" />}
      </div>
    </div>
  );
};

export default PlanRoute;
