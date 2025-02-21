import React, { useMemo, useState } from "react";
import Model, { Providers } from "@tripian/model";
import moment from "moment";
import isoLanguages from "./isoLanguages";
import { Button, RSelect, SvgIcons, TextField } from "@tripian/react";
import ParticipantQuestions from "./Questions/ParticipantQuestions/ParticipantQuestions";
import BookingQuestions from "./Questions/ParticipantQuestions/BookingQuestions";
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

  const [selectedDateTime, setSelectedDateTime] = useState<string>(tourPriceBreakdownOption?.time_slots[0]?.date_time || "");
  const [bookingAnswers, setBookingAnswers] = useState<{ [key: string]: any }>({});
  const [participantAnswers, setParticipantAnswers] = useState<{ [key: string]: any }>({});
  const [freeTextQuestion, setFreeTextQuestion] = useState<string | undefined>();
  const [conductionLanguage, setConductionLanguage] = useState<{ type: string; value: string } | undefined>();

  const selectedTimeSlot: Providers.Gyg.TourPriceBreakdownTimeSlot | undefined = useMemo(
    () => tourPriceBreakdownOption?.time_slots.find((t) => moment(t.date_time).utcOffset(0).isSame(moment(selectedDateTime).utcOffset(0))),
    [selectedDateTime, tourPriceBreakdownOption?.time_slots]
  );

  const totalCountAndInRange = useMemo((): boolean => {
    const totalCount = personsCategories.reduce((acc, category) => acc + category.count, 0);
    if (!participantsRange) return true;
    return totalCount >= participantsRange.min && totalCount <= participantsRange.max;
  }, [participantsRange, personsCategories]);

  const getCategories = (selectedTimeSlot) => {
    const mergedCategories = {};

    if (!selectedTimeSlot?.price_breakdown) {
      return []; // Return an empty array if price_breakdown is undefined
    }

    if (selectedTimeSlot.price_breakdown.individuals) {
      selectedTimeSlot.price_breakdown.individuals.forEach((individual) => {
        const categoryId = individual.category_id;
        const ticketCategory = individual.ticket_category || "individual";
        if (mergedCategories[categoryId]) {
          mergedCategories[categoryId].number_of_participants += individual.quantity;
        } else {
          mergedCategories[categoryId] = {
            number_of_participants: individual.quantity,
            ticketCategory,
          };
        }
      });
    }

    if (selectedTimeSlot.price_breakdown.groups) {
      selectedTimeSlot.price_breakdown.groups.forEach((group) => {
        const categoryId = group.category_id;
        const ticketCategory = "group";
        if (mergedCategories[categoryId]) {
          mergedCategories[categoryId].number_of_participants += group.group_breakdown.quantity;
        } else {
          mergedCategories[categoryId] = {
            number_of_participants: group.group_breakdown.quantity,
            ticketCategory,
          };
        }
      });
    }

    return Object.keys(mergedCategories).map((categoryId) => ({
      category_id: Number(categoryId),
      number_of_participants: mergedCategories[Number(categoryId)].number_of_participants,
      ticketCategory: mergedCategories[Number(categoryId)].ticketCategory,
    }));
  };

  const renderParameters = useMemo(() => {
    if (!tourOption) return undefined;

    const languageOptions = (type: string, languages: string[]) =>
      languages.map((lang) => ({
        type,
        value: lang,
        label: `${isoLanguages.find((iso) => iso.code === lang)?.name || ""} (${type.replace("language_", "").toUpperCase()})`,
      }));

    const allLanguages = [
      ...languageOptions("language_audio", tourOption.cond_language?.language_audio || []),
      ...languageOptions("language_booklet", tourOption.cond_language?.language_booklet || []),
      ...languageOptions("language_live", tourOption.cond_language?.language_live || []),
    ];

    if (allLanguages.length > 0 && !conductionLanguage) {
      setConductionLanguage({ type: allLanguages[0].type, value: allLanguages[0].value });
    }

    return (
      <div>
        {/* Booking Questions */}
        {tourOption.questions.booking_questions && (
          <BookingQuestions questions={tourOption.questions.booking_questions} onAnswers={(answers) => setBookingAnswers(answers)} t={t} />
        )}

        {/* Participant Questions */}
        {tourOption.questions.participant_questions.length > 0 &&
          personsCategories.map((category) =>
            Array.from({ length: category.count }).map((_, travelerIndex) => (
              <div key={`traveler_${category.ticket_category}_${travelerIndex}`}>
                <h4 className={classes.parameters}>
                  {category.name} - Traveler {travelerIndex + 1}
                </h4>
                <ParticipantQuestions
                  questions={tourOption.questions.participant_questions}
                  onAnswers={(answers) =>
                    setParticipantAnswers((prev) => ({
                      ...prev,
                      [category.ticket_category]: [...(prev[category.ticket_category] || []), { participant_answers: answers }],
                    }))
                  }
                  t={t}
                />
              </div>
            ))
          )}

        {/* Conduction Language */}
        {tourOption.questions.conduction_language?.mandatory && (
          <div>
            <h4 className={classes.parameters}>{t("trips.myTrips.localExperiences.tourDetails.conductionLanguage")} (*)</h4>
            <RSelect
              options={allLanguages.map((lg) => ({
                value: lg.value,
                label: lg.label,
              }))}
              selectedOptionValue={conductionLanguage?.value}
              onSelectedOptionChange={(selectedOption) => {
                const selectedType = allLanguages.find((lg) => lg.value === selectedOption.value)?.type || "";
                setConductionLanguage({
                  type: selectedType,
                  value: selectedOption.value,
                });
              }}
            />
          </div>
        )}

        {/* Free Text Question */}
        {Object.keys(tourOption.questions.free_text_question).length > 0 && (
          <div>
            <h4 className={classes.parameters}>
              {tourOption.questions.free_text_question.description} {tourOption.questions.free_text_question.mandatory ? "(*)" : ""}
            </h4>
            <TextField type="text" name="free_text_question" value={freeTextQuestion || ""} onChange={(event) => setFreeTextQuestion(event.target.value)} />
          </div>
        )}
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourOption, conductionLanguage, personsCategories, freeTextQuestion]);

  const addToCart = () => {
    const optionId = tourOption?.option_id;

    if (selectedTimeSlot) {
      const retailPrice = selectedTimeSlot.price_breakdown.price_summary.retail_price;

      if (retailPrice !== undefined) {
        const categories = getCategories(selectedTimeSlot);

        const formattedParticipantQuestions = categories.map((category) => {
          const personCategory = personsCategories.find((pCategory) => pCategory.ticket_category === category.ticketCategory);

          return {
            category_id: category.category_id,
            participant_answers: participantAnswers[personCategory?.ticket_category || category.category_id]?.reduce(
              (acc, answers) => ({
                ...acc,
                ...answers,
              }),
              {}
            ),
          };
        });

        const bookingRequest: Providers.Gyg.TourBookingRequest = {
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
                categories: categories.map((category) => ({
                  category_id: category.category_id,
                  number_of_participants: category.number_of_participants,
                })),
                questions: {
                  booking_questions: Object.keys(bookingAnswers).length > 0 ? bookingAnswers : undefined,
                  participant_questions: formattedParticipantQuestions.length > 0 ? formattedParticipantQuestions : undefined,
                  conduction_language: conductionLanguage,
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
    <div className={classes.mainDiv} role="button" tabIndex={0}>
      <div className="p-4">
        <h3 className={classes.optionDiv}>{title}</h3>
        <div className={classes.gygTourOptionHour}>
          <SvgIcons.Clock /> {tourOption?.duration} {tourOption?.duration_unit}
        </div>
        {tourOption?.meeting_point && (
          <div>
            {t("trips.myTrips.localExperiences.tourDetails.meetingPoint")}: {tourOption?.meeting_point}
          </div>
        )}
        {tourOption?.pick_up && (
          <div>
            {t("trips.myTrips.localExperiences.tourDetails.pickup")}: {tourOption?.pick_up}
          </div>
        )}
      </div>
      {totalCountAndInRange ? (
        <>
          <div className="p-4">
            <div className={classes.startingTimesLabel}>{t("trips.myTrips.localExperiences.tourDetails.startingTime")}</div>
            <div className={classes.startTime}>{moment(startTime).format("dddd, ll")}</div>
            <div className={classes.timeOptions}>
              {tourPriceBreakdownOption?.time_slots.map((time_slot, index) => (
                <div
                  key={index}
                  className={`${classes.timeOption} ${selectedDateTime === time_slot.date_time ? classes.selectedTimeOption : ""}`}
                  onClick={() => setSelectedDateTime(time_slot.date_time)}
                >
                  {moment(time_slot.date_time).format("LT")}
                </div>
              ))}
            </div>
            <div>
              <div className={classes.priceBreakdown}>{t("trips.myTrips.localExperiences.tourDetails.priceBreakdown")}</div>

              {selectedTimeSlot?.price_breakdown?.individuals &&
                selectedTimeSlot.price_breakdown.individuals.map((i, index) => (
                  <div key={`${i.ticket_category}-${index}`}>
                    <span style={{ textTransform: "capitalize" }}>{i.ticket_category}</span>
                    <span>{i.quantity}</span> × <span>{i.price.customer_base_price}</span>
                    <span>{i.price.currency}</span>
                  </div>
                ))}

              {selectedTimeSlot?.price_breakdown?.groups &&
                selectedTimeSlot.price_breakdown.groups.map((g, index) => (
                  <div key={`group-${g.category_id}-${index}`}>
                    <span style={{ textTransform: "capitalize" }}>{t("trips.myTrips.localExperiences.tourDetails.group")}, </span>
                    <span>
                      {g.group_breakdown.quantity} {t("trips.myTrips.localExperiences.tourDetails.person")}
                    </span>{" "}
                    : <span>{g.group_breakdown.price.customer_base_price}</span>
                    <span>{g.group_breakdown.price.currency}</span>
                  </div>
                ))}
            </div>
            <div>{renderParameters}</div>
          </div>

          <div className={classes.gygTourOptionsBottom}>
            <div className={classes.totalPrice}>
              <div className={classes.totalPriceText}>{t("trips.myTrips.localExperiences.tourDetails.totalPrice")}</div>
              <div>
                {selectedTimeSlot && (
                  <>
                    <span className={classes.gygTourOptionsBottomPrice}>{selectedTimeSlot?.price_breakdown?.price_summary?.retail_price}</span>&nbsp;
                    <span className={classes.gygTourOptionsBottomPrice}>{selectedTimeSlot?.price_breakdown?.price_summary?.currency}</span>
                  </>
                )}
              </div>
              <div className={classes.totalPriceText}>{t("trips.myTrips.localExperiences.tourDetails.taxesAndFees")}</div>
            </div>
            <Button className={classes.addToCartButton} onClick={addToCart} text={t("trips.myTrips.localExperiences.tourDetails.bookNow")} />
          </div>
        </>
      ) : (
        <div className={classes.warning}>
          {t("trips.myTrips.localExperiences.tourDetails.participantsForThisActivity")} {t("trips.myTrips.localExperiences.tourDetails.min")}: {participantsRange?.min} -{" "}
          {t("trips.myTrips.localExperiences.tourDetails.max")}:{participantsRange?.max}
        </div>
      )}
    </div>
  );
};

export default GygTourOption;
