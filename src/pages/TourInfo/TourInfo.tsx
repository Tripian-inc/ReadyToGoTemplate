import React from "react";
import { useLocation, useParams } from "react-router";
import Model from "@tripian/model";
import ViatorTourInfo from "./ViatorTourInfo/ViatorTourInfo";
import GygTourInfo from "./GygTourInfo/GygTourInfo";
import BbTourInfo from "./BbTourInfo/BbTourInfo";
import useTranslate from "../../hooks/useTranslate";

// http://localhost:3000/tour/4/407440?start_date=2023-12-29&end_date=2023-01-15
// http://localhost:3000/tour/4/10505?start_date=2023-12-29&end_date=2023-01-15

const TourInfoPage = () => {
  // /:providerId/:id?start_date=:date&end_date=:date&adults=:adult&children=:children
  //  YELP = 2,
  //  GYG = 4,
  //  OPEN_TABLE = 5,
  //  BOOK_BARBADOS = 6,
  //  UBER = 7

  const { providerId, id } = useParams<{
    providerId: string;
    id: string;
  }>();

  const useQuery = <T extends { [K in keyof T]?: string } = {}>(): T => {
    const query = new URLSearchParams(useLocation().search);
    const result: T = {} as T;
    query.forEach((val, key) => {
      result[key] = val;
    });

    return result;
  };
  const { city_id, city_name, start_date, end_date, adults, children } = useQuery<{
    city_id: string | undefined;
    city_name: string | undefined;
    start_date: string | undefined;
    end_date: string | undefined;
    adults: string | undefined;
    children: string | undefined;
  }>();

  const { t } = useTranslate();

  if (Number(providerId) === Model.PROVIDER_ID.GYG)
    return (
      <GygTourInfo
        cityId={Number(city_id)}
        cityName={city_name}
        tourId={Number(id)}
        adults={Number(adults)}
        startDate={start_date}
        endDate={end_date}
        children={Number(children)}
        t={t}
      />
    );

  if (Number(providerId) === Model.PROVIDER_ID.VIATOR) return <ViatorTourInfo tourId={id} />;

  if (Number(providerId) === Model.PROVIDER_ID.BOOK_BARBADOS)
    return <BbTourInfo tourId={Number(id)} startDate={start_date} endDate={end_date} adults={adults} children={children} t={t} />;

  return null;
};

export default TourInfoPage;
