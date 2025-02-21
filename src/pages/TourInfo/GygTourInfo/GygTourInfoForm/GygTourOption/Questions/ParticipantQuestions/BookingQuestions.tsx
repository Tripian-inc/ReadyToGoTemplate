import React, { useState, useEffect } from "react";
import { TextField } from "@tripian/react";
import Model, { Providers } from "@tripian/model";
import { formatBookingAnswer, getBookingQuestionDetails } from "../../helper";

interface BookingQuestionsProps {
  questions: Providers.Gyg.ParticipantQuestion[];
  onAnswers: (answers: { [key: string]: any }) => void;
  t: (value: Model.TranslationKey) => string;
}

const BookingQuestions: React.FC<BookingQuestionsProps> = ({ questions, onAnswers, t }) => {
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (Object.keys(answers).length) {
      onAnswers(answers);
    }
  }, [answers, onAnswers]);

  const handleAnswerChange = (questionKey: string, value: any) => {
    const formattedAnswer = formatBookingAnswer(questionKey, value, t);

    setAnswers((prev) => {
      if (prev[questionKey] === formattedAnswer) return prev;

      return {
        ...prev,
        [questionKey]: formattedAnswer,
      };
    });
  };

  return (
    <div>
      {questions.map((q) => {
        const questionDetails = getBookingQuestionDetails(q.question, t);

        return questionDetails.map((questionDetail) => (
          <div key={questionDetail.question}>
            <h4>
              {questionDetail.description} {questionDetail.mandatory ? "(*)" : ""}
            </h4>
            {questionDetail.inputType === "text" && (
              <TextField
                type="text"
                name={questionDetail.question}
                onChange={(e) => handleAnswerChange(questionDetail.question, e.target.value)}
                value={answers[questionDetail.question]?.value || answers[questionDetail.question] || ""}
                required={questionDetail.mandatory}
              />
            )}
            {questionDetail.inputType === "number" && (
              <TextField
                type="number"
                name={questionDetail.question}
                onChange={(e) => handleAnswerChange(questionDetail.question, parseFloat(e.target.value))}
                value={answers[questionDetail.question]?.value || answers[questionDetail.question] || ""}
                required={questionDetail.mandatory}
              />
            )}
            {questionDetail.inputType === "date" && (
              <TextField
                type="date"
                name={questionDetail.question}
                onChange={(e) => handleAnswerChange(questionDetail.question, e.target.value)}
                value={answers[questionDetail.question]?.value || answers[questionDetail.question] || ""}
                required={questionDetail.mandatory}
              />
            )}
          </div>
        ));
      })}
    </div>
  );
};

export default BookingQuestions;
