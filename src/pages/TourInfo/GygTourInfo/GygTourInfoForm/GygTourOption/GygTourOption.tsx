import React, { useMemo, useState } from "react";
import Model, { Providers } from "@tripian/model";
import moment from "moment";
import isoLanguages from "./isoLanguages";
import { Button, RSelect, SvgIcons, TextField } from "@tripian/react";
import classes from "./GygTourOption.module.scss";

interface IGygTourOption {
  tourPriceBreakdownOption?: Providers.Gyg.TourPriceBreakdownOption;
  tourOption?: Providers.Gyg.TourOptionNew;
  title?: string;
  startTime?: string;
  personsCategories: (Providers.Gyg.PersonCategory & { count: number })[];
  participantsRange?: {
    min: number;
    max: number;
  };
  bookingRequestCallback: (bookingRequest: Providers.Gyg.TourBookingRequest) => void;
  t: (value: Model.TranslationKey) => string;
}

const GygTourOption: React.FC<IGygTourOption> = ({ tourPriceBreakdownOption, tourOption, title, startTime, personsCategories, participantsRange, bookingRequestCallback, t }) => {
  moment.locale(window.twindow.langCode);

  const [selectedDateTime, setSelectedDateTime] = useState<string>(tourPriceBreakdownOption?.time_slots[0].date_time || "");
  const [bookingParameters, setBookingParameters] = useState<{ type: string; value: string }>();
  const [bookingQuestions, setBookingQuestions] = useState<string[]>(new Array(tourOption?.questions.booking_questions?.length ?? 0).fill(""));
  const [participantQuestions, setParticipantQuestions] = useState<string[]>(new Array(tourOption?.questions.participant_questions?.length ?? 0).fill(""));
  const [freeTextQuestion, setFreeTextQuestion] = useState<string>("");

  const selectedTimeSlot: Providers.Gyg.TourPriceBreakdownTimeSlot | undefined = useMemo(
    () =>
      tourPriceBreakdownOption?.time_slots.find((t) => {
        return moment(t.date_time).utcOffset(0).isSame(moment(selectedDateTime).utcOffset(0));
      }),
    [selectedDateTime, tourPriceBreakdownOption?.time_slots]
  );

  const totalCountAndInRange = useMemo((): boolean => {
    const totalCount = personsCategories.reduce((acc, category) => acc + category.count, 0);

    if (!participantsRange) return true;

    return totalCount >= participantsRange.min && totalCount <= participantsRange.max;
  }, [participantsRange, personsCategories]);

  // useEffect(() => {
  //   if (languageOptionArray.length > 0 && !bookingParameters) {
  //     const newBookingParameter = {
  //       type: languageOptionArray[0].type,
  //       value: languageOptionArray[0].language,
  //     };
  //     setBookingParameters(newBookingParameter);
  //   }
  // }, [languageOptionArray, bookingParameters]);

  const renderParameters = useMemo(() => {
    if (tourOption && tourOption.booking_parameter.length > 0) {
      const languageOptionArray: { type: string; language: string; label: string }[] = [];

      if (tourOption.cond_language && tourOption.cond_language.language_audio.length > 0) {
        tourOption.cond_language.language_audio.forEach((lo) => {
          languageOptionArray.push({ type: "language_audio", language: lo, label: `${isoLanguages.find((iso) => iso.code === lo)?.name || ""}(Audio)` });
        });
      }

      if (tourOption.cond_language && tourOption.cond_language.language_booklet.length > 0) {
        tourOption.cond_language.language_booklet.forEach((lo) => {
          languageOptionArray.push({ type: "language_booklet", language: lo, label: `${isoLanguages.find((iso) => iso.code === lo)?.name || ""}(Booklet)` });
        });
      }

      if (tourOption.cond_language && tourOption.cond_language.language_live.length > 0) {
        tourOption.cond_language.language_live.forEach((lo) => {
          languageOptionArray.push({ type: "language_live", language: lo, label: `${isoLanguages.find((iso) => iso.code === lo)?.name || ""}(Live)` });
        });
      }

      if (languageOptionArray.length > 0 && !bookingParameters) {
        const newBookingParameter = {
          type: languageOptionArray[0].type,
          value: languageOptionArray[0].language,
        };
        setBookingParameters(newBookingParameter);
      }

      return (
        <div>
          {tourOption.booking_parameter.map((bp, index) => {
            return (
              <div key={`tour-option-1-${bp.name}`}>
                <h4 className={classes.parameters}>
                  {bp.name} {bp.mandatory ? "(*)" : ""}
                </h4>
                {languageOptionArray.length > 0 && (
                  <RSelect
                    options={languageOptionArray.map((lg) => ({
                      value: lg.language,
                      label: lg.label,
                    }))}
                    selectedOptionValue={bookingParameters?.value}
                    onSelectedOptionChange={(selectedOption) => {
                      const newBookingParameters = {
                        type: languageOptionArray[index].type,
                        value: selectedOption.value,
                      };
                      setBookingParameters(newBookingParameters);
                    }}
                  />
                )}
              </div>
            );
          })}

          {tourOption.questions.booking_questions.length > 0 &&
            tourOption.questions.booking_questions.map((booking_question, index) => (
              <div key={`booking_question-${booking_question.question}`}>
                <h4 className={classes.parameters}>
                  {booking_question.description} {booking_question.mandatory ? "(*)" : ""}
                </h4>
                <TextField
                  type="text"
                  name={booking_question.question}
                  value={bookingQuestions[index]}
                  onChange={(event) => {
                    const newBookingQuestions = [...bookingQuestions];
                    newBookingQuestions[index] = event.target.value;
                    setBookingQuestions(newBookingQuestions);
                  }}
                />
              </div>
            ))}

          {tourOption.questions.participant_questions.length > 0 &&
            tourOption.questions.participant_questions.map((participant_question, index) => (
              <div key={`booking_question-${participant_question.question}`}>
                <h4 className={classes.parameters}>
                  {participant_question.description} {participant_question.mandatory ? "(*)" : ""}
                </h4>
                <TextField
                  type="text"
                  name={participant_question.question}
                  value={participantQuestions[index]}
                  onChange={(event) => {
                    const newParticipantQuestions = [...participantQuestions];
                    newParticipantQuestions[index] = event.target.value;
                    setParticipantQuestions(newParticipantQuestions);
                  }}
                />
              </div>
            ))}

          {Object.keys(tourOption.questions.free_text_question).length > 0 && (
            <div>
              <h4 className={classes.parameters}>
                {tourOption.questions.free_text_question.description} {tourOption.questions.free_text_question.mandatory ? "(*)" : ""}
              </h4>
              <TextField
                type="text"
                name="free_text_question"
                value={freeTextQuestion}
                onChange={(event) => {
                  setFreeTextQuestion(event.target.value);
                }}
              />
            </div>
          )}
        </div>
      );
    }
    return undefined;
  }, [tourOption, bookingParameters, freeTextQuestion, bookingQuestions, participantQuestions]);

  const getCategories = (selectedTimeSlot: Providers.Gyg.TourPriceBreakdownTimeSlot | undefined) => {
    const mergedCategories = {};
    selectedTimeSlot?.price_breakdown?.individuals?.forEach((individual) => {
      const categoryId = individual.category_id;
      mergedCategories[categoryId] = (mergedCategories[categoryId] || 0) + individual.quantity;
    });
    return Object.keys(mergedCategories).map((categoryId) => ({
      category_id: Number(categoryId),
      number_of_participants: mergedCategories[categoryId],
    }));
  };

  const addToCart = () => {
    const optionId = tourOption?.option_id;

    if (selectedTimeSlot) {
      const retailPrice = selectedTimeSlot?.price_breakdown.price_summary.retail_price;

      if (retailPrice !== undefined) {
        const categories = getCategories(selectedTimeSlot);

        const bookingRequest = {
          base_data: {
            cnt_language: "en",
            currency: "USD",
          },
          data: {
            booking: {
              bookable: {
                external_reference_id: "tripian",
                option_id: optionId || 0,
                datetime: selectedDateTime,
                price: retailPrice,
                categories: categories,
                questions: {
                  booking_questions: tourOption?.questions.booking_questions.reduce((acc, booking_question, index) => {
                    acc[booking_question.question] = { value: bookingQuestions[index] };
                    return acc;
                  }, {}),
                  participant_questions: tourOption?.questions.participant_questions.map((question, index) => ({
                    category_id: 1,
                    participant_answers: { [question.question]: { value: participantQuestions[index] } },
                  })),
                  conduction_language: bookingParameters
                    ? {
                        type: bookingParameters.type,
                        value: bookingParameters.value,
                      }
                    : undefined,
                  free_text_question: freeTextQuestion,
                },
              },
            },
          },
        };
        bookingRequestCallback(bookingRequest);
      }
    } else {
      console.error("Option ID, retail price, or questions are undefined.");
    }
  };

  return (
    <div
      className={classes.mainDiv}
      onClick={() => {
        if (tourPriceBreakdownOption?.time_slots.length === 0) {
          // addToChart();
        }
      }}
      role="button"
      tabIndex={0}
      onKeyPress={() => {}}
    >
      <div className="p-4">
        <h3 className={classes.optionDiv}>{title}</h3>
        <div className={classes.gygTourOptionHour}>
          <SvgIcons.Clock /> {tourOption?.duration} {tourOption?.duration_unit}
        </div>
        <div>Meet at {tourOption?.meeting_point}</div>
      </div>

      {totalCountAndInRange ? (
        <>
          <div className="p-4">
            <div className={classes.startingTimesLabel}>Select a starting time</div>
            <div className={classes.startTime}>{moment(startTime).format("dddd, ll")}</div>
            <div className={classes.timeOptions}>
              {tourPriceBreakdownOption?.time_slots.map((time_slot, index) => (
                <div
                  className={`${classes.timeOption} ${selectedDateTime === time_slot.date_time ? classes.selectedTimeOption : ""}`}
                  key={index}
                  onClick={() => {
                    setSelectedDateTime(time_slot.date_time);
                  }}
                >
                  {moment(time_slot.date_time).format("LT")}
                </div>
              ))}
            </div>
            <div>
              <div className={classes.priceBreakdown}>Price breakdown</div>
              {selectedTimeSlot && (
                <div>
                  <div>
                    {selectedTimeSlot.price_breakdown.individuals.map((i, index) => (
                      <div key={index}>
                        <span style={{ textTransform: "capitalize" }}>{i.ticket_category}</span> <span>{i.quantity}</span> × <span>{i.price.customer_base_price}</span>{" "}
                        <span>{i.price.currency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {renderParameters}
          </div>

          <div className={classes.gygTourOptionsBottom}>
            <div className={classes.totalPrice}>
              <div className={classes.totalPriceText}>Total price</div>
              <div>
                <span className={classes.gygTourOptionsBottomPrice}>{selectedTimeSlot?.price_breakdown.price_summary.retail_price}</span>&nbsp;
                <span className={classes.gygTourOptionsBottomPrice}>{selectedTimeSlot?.price_breakdown.price_summary.currency}</span>
              </div>
              <div className={classes.totalPriceText}>All taxes and fees included</div>
            </div>
            <Button /* disabled={isButtonDisabled} */ className={classes.addToCartButton} onClick={addToCart} text={t("trips.myTrips.localExperiences.tourDetails.bookNow")} />
          </div>
        </>
      ) : (
        <div className={classes.warning}>
          Please select min {participantsRange?.min} and max {participantsRange?.max} participants for this activity.
        </div>
      )}
    </div>
  );
};

export default GygTourOption;
