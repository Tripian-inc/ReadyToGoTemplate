import React from "react";
import { useParams } from "react-router";
import "./Widgets.module.scss";
import TourInfoWidget from "./TourInfoWidget/TourInfoWidget";
import AgentWidget from "./AgentWidget/AgentWidget";

// tourInfo
// http://localhost:3000/widgets/tourInfo?providerId=4&id=407440&start_date=2023-12-29&end_date=2023-01-15&adults=6&children=4

// agentCreateTrip
// http://localhost:3000/widgets/agentCreateTrip?userId=User_1234

const WidgetsPage = () => {
  const { widgetName } = useParams<{ widgetName: string }>();

  if (widgetName === "tourInfo") return <TourInfoWidget />;

  if (widgetName === "agentCreateTrip") return <AgentWidget />;

  return <h3>Widget Not Found!</h3>;
};

export default WidgetsPage;
