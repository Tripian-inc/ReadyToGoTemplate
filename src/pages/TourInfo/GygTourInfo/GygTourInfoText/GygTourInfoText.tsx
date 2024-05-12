/* eslint-disable react/no-danger */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Providers } from '@tripian/model';
import classes from './GygTourInfoText.scss';

interface IGygTourInfoText {
  tour: Providers.Gyg.Tour;
}

const GygTourInfoText: React.FC<IGygTourInfoText> = ({ tour }) => {
  const excludeCategoryIds = [18];
  const categories = tour.categories.filter((category) => !tour.categories.find((c) => c.parent_id === category.category_id) && !excludeCategoryIds.includes(category.parent_id ? category.parent_id : 0));

  const splitInfo = (info: string | undefined) => {
    if (info) {
      const splittedInfo = info.split(/\r\n|\n|\r/);
      return splittedInfo;
    }
    return [];
  };

  return (
    <>
      <div className={classes.gygTourInfoText}>
        <div className={classes.gygTourInfoContent}>
          {tour.description && (
            <ul>
              <li>
                <div className={classes.gygTourInfoDescription}>
                  <input type="checkbox" id="description" className={classes.gygTourInfoDescToggle} />
                  <label htmlFor="description" className={classes.gygTourInfoDescContent}>
                    {tour.description}
                  </label>
                </div>
              </li>
            </ul>
          )}
          <div className="row mb2">
            <div className="col col12">
              {categories.map((category) => (
                <span key={`category-${category.category_id}}`} className={classes.tourInfoCategories}>
                  {category.name}
                </span>
              ))}
            </div>
          </div>
          <hr className="mb6" style={{ opacity: 0.2 }} />
          <div className={`row mb2 ${classes.tourInfoAlign}`}>
            <div className="col col12 col2-m">
              <h4>Abstract</h4>
            </div>
            <div className="col col12 col10-m">{tour.abstract}</div>
          </div>
          <div className="row mb2">
            <div className="col col12 col2-m">
              <h4>Duration</h4>
            </div>
            <div className="col col12 col10-m">
              {tour.durations.map((duration) => (
                <span key={`duration-${duration.duration}`}>{`${duration.duration}  ${duration.unit} `}</span>
              ))}
            </div>
          </div>
          {tour.highlights && (
            <div className={`row mb2 ${classes.tourInfoAlign}`}>
              <div className="col col12 col2-m">
                <h4>Highlights</h4>
              </div>
              <div className="col col12 col10-m">
                {tour.highlights.map((highlight) => (
                  <div key={`highlight-${Math.random()}`}>
                    <span>&bull; {highlight}</span>
                    <br />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={`row mb2 ${classes.tourInfoAlign}`}>
            <div className="col col12 col2-m">
              <h4>Places</h4>
            </div>
            <div className="col col12 col10-m">
              {tour.locations.map((location) => (
                <div key={`places-${location.location_id}-${Math.random()}`}>
                  <span>&bull; {location.name}</span>
                  <br />
                </div>
              ))}
            </div>
          </div>
          {tour.inclusions && (
            <>
              <hr className="mb6" style={{ opacity: 0.2 }} />
              <div className="row mb0">
                <div className="col col12">
                  <h3>What&apos;s included?</h3>
                  {splitInfo(tour.inclusions).map((inclusion) => (
                    <div key={`inclusions-${Math.random()}`}>
                      <span>{inclusion}</span>
                      <br />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {tour.exclusions && (
            <div className="row mb0">
              <div className="col col12">
                <h3>What&apos;s excluded?</h3>
                {splitInfo(tour.exclusions).map((exclusion) => (
                  <div key={`exclusions-${Math.random()}`}>
                    <span>{exclusion}</span>
                    <br />
                  </div>
                ))}
              </div>
            </div>
          )}
          {tour.additional_information && (
            <div className="row mb0">
              <div className="col col12">
                <h3>Additional Info</h3>
                {splitInfo(tour.additional_information).map((info) => (
                  <div key={`additional_information-${Math.random()}`}>
                    <span>{info}</span>
                    <br />
                  </div>
                ))}
              </div>
            </div>
          )}
          {tour.cancellation_policy_text && (
            <div className="row mb0">
              <div className="col col12">
                <h3>Cancellation Policy</h3>
                <p>{tour.cancellation_policy_text}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GygTourInfoText;
