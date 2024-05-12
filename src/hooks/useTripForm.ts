import { useEffect, useMemo } from 'react';

import useCities from './useCities';
import useQuestionTrip from './useQuestionTrip';
import useQuestionCompanion from './useQuestionCompanion';
import useCompanion from './useCompanion';

const useTripForm = () => {
  const { cities, loadingCities } = useCities();
  const { questionsTrip, loadingQuestionsTrip } = useQuestionTrip();
  const { questionsCompanion, loadingQuestionsCompanion } = useQuestionCompanion();
  const { companionsFetch } = useCompanion();

  useEffect(() => {
    companionsFetch();
  }, [companionsFetch]);

  const initialLoading: boolean = useMemo(() => !loadingCities && !loadingQuestionsTrip && !loadingQuestionsCompanion, [loadingCities, loadingQuestionsCompanion, loadingQuestionsTrip]);

  return { initialLoading, loadingCities, loadingQuestionsTrip, loadingQuestionsCompanion, cities, questionsTrip, questionsCompanion };
};

export default useTripForm;
