import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import Model, { Providers } from "@tripian/model";
import { providers } from "@tripian/core";
import { PreLoading } from "@tripian/react";
import useUser from "../../../hooks/useUser";
import "./TourInfoWidget.module.scss";

// http://localhost:3000/tour/4/407440?start_date=2023-12-29&end_date=2023-01-15
// http://localhost:3000/tour/4/10505?start_date=2023-12-29&end_date=2023-01-15

const TourInfoWidget = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const [gygTourData, setGygTourData] = useState<Providers.Gyg.TourDataEx | undefined>(undefined);
  // const [bbTourState, setBbTourState] = useState<Providers.Bb.Activity | undefined>(undefined);

  const [availableDate, setAvailableDate] = useState<string | undefined>(undefined);
  const [personsCategories, setPersonsCategories] = useState<(Providers.Gyg.TourDataFormPersonsCategory & { count: number })[]>([]);
  const [availableOptions, setAvailableOptions] = useState<Providers.Gyg.TourDataOption[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<Providers.Gyg.TourDataOption | undefined>(undefined);
  const [selectedAvailable, setSelectedAvailable] = useState<Providers.Gyg.TourDataOptionAvailability | undefined>(undefined);

  const [priceTotal, setPriceTotal] = useState<number>(0);

  const useQuery = <T extends { [K in keyof T]?: string } = {}>(): T => {
    const query = new URLSearchParams(useLocation().search);
    const result: T = {} as T;
    query.forEach((val, key) => {
      result[key] = val;
    });

    return result;
  };
  // /:widgetName/?providerId=:providerId&id=:id&date=:date&adult=:adult&children=:children
  //  YELP = 2,
  //  GYG = 4,
  //  OPEN_TABLE = 5,
  //  BOOK_BARBADOS = 6,
  //  UBER = 7
  const { providerId, id, start_date, end_date, adults, children } = useQuery<{
    providerId: string;
    id: string;
    start_date: string | undefined;
    end_date: string | undefined;
    adults: string | undefined;
    children: string | undefined;
  }>();

  useEffect(() => {
    console.log("providerId, id", providerId, id);
    if (Number(providerId) === Model.PROVIDER_ID.GYG) {
      providers.gyg
        ?.tourDataEx(Number(id), start_date ? start_date + "T00:00:00" : "2023-12-29T00:00:00", end_date ? end_date + "T23:59:59" : "2023-01-15T23:59:59")
        .then((data) => {
          setGygTourData(data);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [end_date, id, providerId, start_date]);

  useEffect(() => {
    if (gygTourData?.availableDates && gygTourData?.availableDates.length > 0) {
      setAvailableDate(gygTourData?.availableDates[0]);
    }
  }, [gygTourData?.availableDates]);

  useEffect(() => {
    if (gygTourData?.formPersonsCategories) {
      const newPersonsCategories = gygTourData.formPersonsCategories.map((x) => ({ ...x, count: 0 }));

      if (adults) {
        const adultsCount = Number(adults);
        const newAdultsCategories = newPersonsCategories.find((x) => x.name === "Adults");
        if (newAdultsCategories) {
          newAdultsCategories.count = adultsCount;
        }
      }

      if (children) {
        const childrenCount = Number(children);
        const newChildrenCategories = newPersonsCategories.find((x) => x.name === "Children");
        if (newChildrenCategories) {
          newChildrenCategories.count = childrenCount;
        }
      }

      setPersonsCategories(newPersonsCategories);
    }
  }, [adults, children, gygTourData?.formPersonsCategories]);

  useEffect(() => {
    if (gygTourData === undefined || availableDate === undefined) {
      setAvailableOptions([]);
      setSelectedOptions(undefined);
      setSelectedAvailable(undefined);
    } else {
      const newAvailableOptions: Providers.Gyg.TourDataOption[] = [];

      const totalParticipants = personsCategories.filter((x) => x.stand_alone).reduce((p, c) => p + c.count, 0);
      gygTourData.options.forEach((x) => {
        const odates = x.availabilities.filter((a) => {
          return a.start_time.startsWith(availableDate) && a.total_minimum_participants <= totalParticipants;
        });
        if (odates.length > 0) {
          newAvailableOptions.push({ ...x, availabilities: odates });
        }
      });
      setAvailableOptions(newAvailableOptions);
      if (newAvailableOptions.length > 0) {
        setSelectedOptions(newAvailableOptions[0]);
        if (newAvailableOptions[0].availabilities.length > 0) setSelectedAvailable(newAvailableOptions[0].availabilities[0]);
        else {
          setSelectedAvailable(undefined);
        }
      } else {
        setSelectedOptions(undefined);
        setSelectedAvailable(undefined);
      }
    }
  }, [gygTourData, availableDate, personsCategories]);

  useEffect(() => {
    if (selectedOptions === undefined || selectedOptions.availabilities.length === 0) {
      setSelectedAvailable(undefined);
    } else {
      setSelectedAvailable(selectedOptions.availabilities[0]);
    }
  }, [selectedOptions]);

  useEffect(() => {
    let newPriceTotal = 0;
    if (selectedAvailable) {
      personsCategories.forEach((pc) => {
        if (pc.count > 0) {
          const scales = selectedAvailable.categories.find((x) => pc.id === x.id)?.scale;
          const scale = scales?.find((x) => x.min_participants <= pc.count && x.max_participants >= pc.count);
          if (scale) {
            if (scale.type === "pax") {
              newPriceTotal += pc.count * scale.retail_price; // net_price;
            } else if (scale.type === "flat") {
              newPriceTotal += scale.retail_price; // net_price;
            } else {
              console.error("Unknown scale.type!", pc, scale);
              alert("Unknown scale.type!");
            }
          } else {
            console.error("Scale not found!", pc, scales);
            alert("Scale not found!");
          }
        }
      });
    }
    // console.log(newPriceTotal, Number(newPriceTotal.toFixed(2)));
    setPriceTotal(Number(newPriceTotal.toFixed(2)));
  }, [personsCategories, selectedAvailable]);

  console.log("selectedAvailable", selectedAvailable);
  // Render
  if (loading) return <PreLoading />;
  if (error) return <h2>Error: {error}</h2>;
  if (gygTourData === undefined) return <h2>gygTourData is undefined</h2>;

  return (
    <>
      <div className="tcenter">
        <h1>Tour Info</h1>
        <h1>{user ? user.email : "User YOK"}</h1>
        <div className="tbox">
          <span>
            <b>tour_id:</b> {gygTourData.tour.tour_id}
          </span>
          <br />
          <span>
            <b>title:</b> {gygTourData.tour.title}
          </span>
          <br />
          <span>
            <b>url:</b>
            <a href={gygTourData.tour.url} target="_blank" rel="noreferrer">
              {gygTourData.tour.url}
            </a>
          </span>
          <br />
        </div>
      </div>

      <div className="tcenter">
        <h1>Form</h1>
        <div className="tbox">
          <h3>availableDates:</h3>
          {gygTourData.availableDates.length === 0 ? (
            "Not Found"
          ) : (
            <>
              <select
                value={availableDate}
                onChange={(a) => {
                  setAvailableDate(a.target.value);
                }}
              >
                {gygTourData.availableDates.map((availableDate) => {
                  return (
                    <option key={availableDate} value={availableDate}>
                      {availableDate}
                    </option>
                  );
                })}
              </select>
              {gygTourData.formPersonsCategories.map((formPersonsCategory) => {
                const count: number = personsCategories.find((x) => x.id === formPersonsCategory.id)?.count ?? 0;
                return (
                  <div key={formPersonsCategory.id}>
                    <h4>
                      {formPersonsCategory.name} Age:{formPersonsCategory.min_age} - {formPersonsCategory.max_age}
                    </h4>
                    <input
                      value={count}
                      onChange={(e) => {
                        console.log(e.target.value, formPersonsCategory.id, personsCategories);
                        const newCount = e.target.value === "" ? 0 : Number(e.target.value);
                        setPersonsCategories((prev) => {
                          const findX = prev.find((x) => x.id === formPersonsCategory.id);

                          if (findX) {
                            findX.count = newCount;
                            const newState = prev.filter((x) => x.id !== formPersonsCategory.id);
                            newState.push(findX);
                            return newState;
                          }

                          return prev;
                        });
                      }}
                    ></input>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* <div className="tcenter">
        <h1>Params</h1>
        <div className="tbox">
          <h3>availableDate: {availableDate}</h3>
          {personsCategories.map((x) => {
            return (
              <h3>
                Person id:{x.id}, name:{x.name}, count:{x.count}
              </h3>
            );
          })}
        </div>
      </div> */}

      <div className="tcenter">
        <h1>Price Total</h1>
        <div className="tbox">
          <h2>{priceTotal}</h2>
        </div>
      </div>

      <div className="tcenter">
        <h1>Available Options</h1>
        <div className="tbox">
          {availableOptions.map((x) => (
            <div key={x.option_id} className={selectedOptions?.option_id === x.option_id ? "stbox" : "tbox"} onClick={() => setSelectedOptions(x)}>
              <span>
                <b>option.option_id: </b> {x.option_id}
              </span>
              <br />
              <span>
                <b>option.title : </b> {x.title}
              </span>
              <br />
              <div className="tcenter">
                <br />
                <h3>Available Times</h3>
                {x.availabilities.map((y) => {
                  return (
                    <div key={y.availability_id} className={selectedAvailable?.availability_id === y.availability_id ? "stbox" : "tbox"} onClick={() => setSelectedAvailable(y)}>
                      <span>
                        <b>availabilitytime__id:</b> {y.availability_id}
                      </span>
                      <br />
                      <span>
                        <b>start_time:</b> {y.start_time}
                      </span>
                      <br />
                      <span>
                        <b>end_time:</b> {y.end_time}
                      </span>
                      <br />
                      <span>
                        <b>pricing_id:</b> {y.pricing_id}
                      </span>
                      <br />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TourInfoWidget;
