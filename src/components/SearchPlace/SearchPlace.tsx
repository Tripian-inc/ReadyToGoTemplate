import React, { useState, useEffect } from "react";
import Model, { helper } from "@tripian/model";
import { PoiRefCard, Button, PreLoading, Checkbox } from "@tripian/react";

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
  t: (value: Model.TranslationKey) => string;
}

const SearchPlace: React.FC<ISearchPlace> = ({ query, poiCategoryIds, recommendedPois, search, focus, cardButonOnClick, isCurrentDayStep, getDayIndexes, t }) => {
  // Query search
  // const [query, setQuery] = useState<string>("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryPageIndex, setQueryPageIndex] = useState(1);
  const [queryResults, setQueryResults] = useState<Model.Poi[] | undefined>(undefined);
  const [queryFinished, setQueryFinished] = useState(false);

  // Auto complete tags

  // Default category pois
  // const [categoryInit, setCategoryInit] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryPageIndex, setCategoryPageIndex] = useState(1);
  const [categoryResults, setCategoryResults] = useState<Model.Poi[] | undefined>();
  const [categoryFinished, setCategoryFinished] = useState(false);

  // showOffersOnly
  const [showOffersOnly, setShowOffersOnly] = useState(false);

  // Load more
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  // const timerRef = useRef<number | undefined>(undefined);

  /* page 1 default category pois */
  useEffect(() => {
    const fetchCategoryResults = async () => {
      setCategoryLoading(true);
      // console.log("searchAttraction called");
      setCategoryPageIndex(1);
      setCategoryFinished(false);
      search([], poiCategoryIds, showOffersOnly, 1).then((newPois) => {
        setCategoryResults((prevCategoryResult) => {
          if (prevCategoryResult) {
            const filteredPrevCategoryResulsts = prevCategoryResult.filter((poi) => poi.category.some((p) => poiCategoryIds.includes(p.id)));
            return helper.removeDuplicateValuesById<Model.Poi>(filteredPrevCategoryResulsts.concat(newPois.data));
          }
          return newPois.data;
        });
        if (newPois.pagination?.currentPage === newPois.pagination?.totalPages) setCategoryFinished(true);
        setCategoryLoading(false);
      });
    };

    if (poiCategoryIds.length > 0) {
      // setCategoryInit(false);
      fetchCategoryResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poiCategoryIds, poiCategoryIds.length, search]);

  /* query search */
  useEffect(() => {
    // if (query.length > 0) {
    const fetchPois = async () => {
      setQueryLoading(true);
      setQueryResults(undefined);
      setQueryPageIndex(1);
      setQueryFinished(false);

      search(query, poiCategoryIds, showOffersOnly, 1)
        .then((searchPoisResult) => {
          setQueryResults(searchPoisResult.data);
          if (searchPoisResult.pagination?.currentPage === searchPoisResult.pagination?.totalPages) setQueryFinished(true);
          setQueryLoading(false);
        })
        .finally(() => {
          setQueryLoading(false);
        });
    };
    if (poiCategoryIds.length > 0) {
      fetchPois();
    }

    // } else {
    setQueryLoading(false);
    setQueryResults(undefined);
    // }
  }, [poiCategoryIds, query, search, showOffersOnly]);

  // page for query paging
  const queryLoadMore = async () => {
    if (queryResults) {
      setLoadMoreLoading(true);
      // page index
      const newPageIndex = queryPageIndex + 1;
      setQueryPageIndex(newPageIndex);
      const newQueryResults = await search(query, poiCategoryIds, showOffersOnly, newPageIndex);
      // set results
      setQueryResults(helper.removeDuplicateValuesById<Model.Poi>(queryResults.concat(newQueryResults.data)));
      setLoadMoreLoading(false);
      if (newQueryResults.pagination?.currentPage === newQueryResults.pagination?.totalPages) setQueryFinished(true);
    }
  };

  // page for category paging
  const categoryLoadMore = async () => {
    setLoadMoreLoading(true);
    // page index
    const newPageIndex = categoryPageIndex + 1;
    setCategoryPageIndex(newPageIndex);
    const newCategoryResults = await search([], poiCategoryIds, showOffersOnly, newPageIndex);

    // set results
    setCategoryResults((prevCategoryResult) => {
      if (prevCategoryResult) {
        const filteredPrevCategoryResulsts = prevCategoryResult.filter((poi) => poi.category.some((p) => poiCategoryIds.includes(p.id)));
        return helper.removeDuplicateValuesById<Model.Poi>(filteredPrevCategoryResulsts.concat(newCategoryResults.data));
      }
      return newCategoryResults.data;
    });
    if (newCategoryResults.pagination?.currentPage === newCategoryResults.pagination?.totalPages) setCategoryFinished(true);
    setLoadMoreLoading(false);
  };

  const loadMore = () => {
    if (queryLoading || categoryLoading) return null;

    if (queryResults) {
      if (queryResults.length > 19)
        if (!queryFinished)
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
          t={t}
        />
      );
    });

  const renderResult = () => {
    /* This PreLoading means: Searching.... wait. */

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

    // return <span>initial category loading</span>;
  };

  return (
    <div>
      {poiCategoryIds.length > 0 ? (
        <>
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
          {renderResult()}
          {/* This PreLoading means: Load more loading.. wait. */}
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
