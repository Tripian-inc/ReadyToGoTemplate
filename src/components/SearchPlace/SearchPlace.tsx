import React, { useState, useEffect, useMemo } from "react";
import Model, { helper } from "@tripian/model";
import { PoiRefCard, Button, PreLoading, Checkbox } from "@tripian/react";
import { useParams } from "react-router";

interface ISearchPlace {
  // for input
  query: string[];
  poiCategoryIds: number[];
  recommendedPois: Model.Poi[];
  search: (query: string[], searchPoiCategories?: number[], showOffersOnly?: boolean, page?: number) => Promise<Model.DataPayload<Model.Poi[]>>;
  // for actions
  focus: (poi: Model.Poi) => void;
  cardButonOnClick: (poi: Model.Poi, from?: string, to?: string) => void;

  // helper
  isCurrentDayStep: (poiId: string) => boolean;
  getDayIndexes: (poiId: string) => number[];
  gygTourIds: number[];
  bbTourIds: number[];
  viatorTourIds: string[];
  toristyTourIds: string[];
  toursLoading: boolean;
  t: (value: Model.TranslationKey) => string;
}

const SearchPlace: React.FC<ISearchPlace> = ({
  query,
  poiCategoryIds,
  recommendedPois,
  search,
  focus,
  cardButonOnClick,
  isCurrentDayStep,
  getDayIndexes,
  gygTourIds,
  bbTourIds,
  viatorTourIds,
  toristyTourIds,
  toursLoading,
  t,
}) => {
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryPageIndex, setQueryPageIndex] = useState(1);
  const [queryResults, setQueryResults] = useState<Model.Poi[] | undefined>(undefined);
  const [queryFinished, setQueryFinished] = useState(false);

  const { hashParam } = useParams<{ hashParam: string }>();

  const shared = useMemo(() => {
    const params = hashParam.split("!");
    return params.length > 1 && hashParam.split("!")[1] === "s";
  }, [hashParam]);

  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryPageIndex, setCategoryPageIndex] = useState(1);
  const [categoryResults, setCategoryResults] = useState<Model.Poi[] | undefined>();
  const [categoryFinished, setCategoryFinished] = useState(false);

  const [showOffersOnly, setShowOffersOnly] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  useEffect(() => {
    const fetchCategoryResults = async () => {
      setCategoryLoading(true);
      setCategoryPageIndex(1);
      setCategoryFinished(false);
      try {
        const newPois = await search([], poiCategoryIds, showOffersOnly, 1);
        setCategoryResults(newPois.data);
        if (newPois.pagination?.currentPage === newPois.pagination?.totalPages) setCategoryFinished(true);
      } finally {
        setCategoryLoading(false);
      }
    };

    if (poiCategoryIds.length === 1) {
      fetchCategoryResults();
    }
  }, [poiCategoryIds, search, showOffersOnly]);

  useEffect(() => {
    const fetchPois = async () => {
      setQueryLoading(true);
      setQueryResults(undefined);
      setQueryPageIndex(1);
      setQueryFinished(false);
      try {
        const searchPoisResult = await search(query, poiCategoryIds, showOffersOnly, 1);
        setQueryResults(searchPoisResult.data);
        if (searchPoisResult.pagination?.currentPage === searchPoisResult.pagination?.totalPages) setQueryFinished(true);
      } finally {
        setQueryLoading(false);
      }
    };

    if (poiCategoryIds.length > 0) {
      fetchPois();
    } else {
      setQueryLoading(false);
      setQueryResults(undefined);
    }
  }, [poiCategoryIds, query, search, showOffersOnly]);

  const queryLoadMore = async () => {
    if (queryResults) {
      setLoadMoreLoading(true);
      const newPageIndex = queryPageIndex + 1;
      setQueryPageIndex(newPageIndex);
      try {
        const newQueryResults = await search(query, poiCategoryIds, showOffersOnly, newPageIndex);
        setQueryResults(helper.removeDuplicateValuesById<Model.Poi>(queryResults.concat(newQueryResults.data)));
        if (newQueryResults.pagination?.currentPage === newQueryResults.pagination?.totalPages) setQueryFinished(true);
      } finally {
        setLoadMoreLoading(false);
      }
    }
  };

  const categoryLoadMore = async () => {
    setLoadMoreLoading(true);
    const newPageIndex = categoryPageIndex + 1;
    setCategoryPageIndex(newPageIndex);
    try {
      const newCategoryResults = await search([], poiCategoryIds, showOffersOnly, newPageIndex);
      setCategoryResults((prevCategoryResult) => {
        if (prevCategoryResult) {
          const filteredPrevCategoryResulsts = prevCategoryResult.filter((poi) => poi.category.some((p) => poiCategoryIds.includes(p.id)));
          return helper.removeDuplicateValuesById<Model.Poi>(filteredPrevCategoryResulsts.concat(newCategoryResults.data));
        }
        return newCategoryResults.data;
      });
      if (newCategoryResults.pagination?.currentPage === newCategoryResults.pagination?.totalPages) setCategoryFinished(true);
    } finally {
      setLoadMoreLoading(false);
    }
  };

  const loadMore = () => {
    if (queryLoading || categoryLoading) return null;

    if (queryResults) {
      if (queryResults.length > 19 && !queryFinished)
        return (
          <div className="center m5">
            <Button color="primary" text={t("trips.myTrips.exploreMore.loadMore")} onClick={queryLoadMore} />
          </div>
        );
      return null;
    }

    if (!categoryFinished)
      return (
        <div className="center m5">
          <Button color="primary" text={t("trips.myTrips.exploreMore.loadMore")} onClick={categoryLoadMore} />
        </div>
      );

    return null;
  };

  const renderList = (poiList?: Model.Poi[]) =>
    poiList?.map((poiResult) => {
      const dayIndexes = getDayIndexes(poiResult.id);
      const isRecommendation = !dayIndexes.includes(-2);
      let dayNumbers: number[] | undefined;
      if (isRecommendation && !dayIndexes.includes(-1)) {
        dayNumbers = dayIndexes.map((dayIndex) => dayIndex + 1);
      }

      return (
        <PoiRefCard
          key={`search-result-poi-${poiResult.id}`}
          poi={poiResult}
          buttonType={1}
          poiCardClicked={focus}
          inStep={isCurrentDayStep(poiResult.id)}
          isRecommendation={isRecommendation}
          dayNumbers={dayNumbers}
          addRemoveAlternativePoi={cardButonOnClick}
          hideReservationIcon={!window.tconfig.SHOW_RESTAURANT_RESERVATIONS}
          hideTourTicketIcons={!window.tconfig.SHOW_TOURS_AND_TICKETS}
          hideOfferIcon={!window.tconfig.SHOW_OFFERS}
          TOUR_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
          TICKET_PROVIDER_IDS={window.tconfig.TOUR_TICKET_PROVIDER_IDS}
          RESTAURANT_RESERVATION_PROVIDER_IDS={window.tconfig.RESTAURANT_RESERVATION_PROVIDER_IDS}
          gygTourIds={gygTourIds}
          bbTourIds={bbTourIds}
          viatorTourIds={viatorTourIds}
          toristyTourIds={toristyTourIds}
          tourTicketProductsLoading={toursLoading}
          t={t}
        />
      );
    });

  const renderResult = () => {
    if (queryLoading || categoryLoading)
      return (
        <div style={{ height: "4rem" }}>
          <PreLoading />
        </div>
      );

    if (queryResults) {
      if (queryResults.length === 0) return <div className="text-center text-text-primary-color text-sm">{t("trips.myTrips.exploreMore.noResultsFound")}</div>;
      return renderList(queryResults);
    }

    return renderList(helper.removeDuplicateValuesById<Model.Poi>(categoryResults || []));
  };

  return (
    <div>
      {poiCategoryIds.length > 0 ? (
        <>
          {!shared && (
            <div className="flex flex-row justify-between">
              <div className="mb3">
                <Checkbox
                  domId="SearchPlaceShowOffersOnly"
                  text={t("trips.myTrips.exploreMore.onlyWithOffers")}
                  checked={showOffersOnly}
                  onChange={() => {
                    setShowOffersOnly(!showOffersOnly);
                  }}
                />
              </div>
            </div>
          )}

          {renderResult()}

          {loadMoreLoading ? (
            <div style={{ height: "4rem" }}>
              <PreLoading size="small" />
            </div>
          ) : (
            loadMore()
          )}
        </>
      ) : (
        <div className="text-center text-text-primary-color text-sm">{t("trips.myTrips.exploreMore.pleaseSelectCategory")}</div>
      )}
    </div>
  );
};

export default SearchPlace;
