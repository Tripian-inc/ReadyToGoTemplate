export const stepHeaders = (headers: string[]): { stepId: number; header: string }[] => {
  const steps: { stepId: number; header: string }[] = [];

  for (let i = -1; i < headers.length - 1; i++) {
    steps.push({
      stepId: i,
      header: headers[i + 1],
    });
  }

  return steps;
};

/* 
https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/default.png
https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/destination.png
https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/arrival-date.png
https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/departure-date.png
https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/arrival-departure-hour.png
https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/add-travelers.png
https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/add-children.png
https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/accommodation.png
https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/companion.png
 */

export const destinationTips = (tips: { title: string; description: string }[]): { iconUrl: string; title: string; description: string }[] => {
  return [
    {
      title: tips[0].title,
      description: tips[0].description,
      iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/default.svg",
    },
    {
      title: tips[1].title,
      description: tips[1].description,
      iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/destination.svg",
    },
    {
      title: tips[2].title,
      description: tips[2].description,
      iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/arrival-date.svg",
    },
    {
      title: tips[3].title,
      description: tips[3].description,
      iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/departure-date.svg",
    },
    {
      title: tips[4].title,
      description: tips[4].description,
      iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/arrival-departure-hour.svg",
    },
    {
      title: tips[5].title,
      description: tips[5].description,
      iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/arrival-departure-hour.svg",
    },
  ];
};

// export const destinationTips: { iconUrl: string; title: string; description: string }[] = [
//   {
//     title: "Hover the areas for info",
//     description: "If you close a field, we will provide you with relevant explanations.",
//     iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/default.svg",
//   },
//   {
//     title: "Destination",
//     description: "Choose a destination you'd like to visit from our rich database.",
//     iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/destination.svg",
//   },
//   {
//     title: "Arrival Date",
//     description: "Select the arrival date.",
//     iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/arrival-date.svg",
//   },
//   {
//     title: "Departure Date",
//     description: "Select the departure date.",
//     iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/departure-date.svg",
//   },
//   {
//     title: "Arrival Hours",
//     description: "Choose the hour you'll land and depart from your destination.",
//     iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/arrival-departure-hour.svg",
//   },
//   {
//     title: "Departure Hours",
//     description: "Choose the hour you'll land and depart from your destination.",
//     iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/arrival-departure-hour.svg",
//   },
// ];

export const travelerInfoTips = (tips: { title: string; description: string }[]): { iconUrl: string; title: string; description: string }[] => {
  return [
    {
      title: tips[0].title,
      description: tips[0].description,
      iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/default.svg",
    },
    {
      title: tips[1].title,
      description: tips[1].description,
      iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/traveler-numbers-profile.svg",
    },
    {
      title: tips[2].title,
      description: tips[2].description,
      iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/traveler-numbers-children.svg",
    },
    {
      title: tips[3].title,
      description: tips[3].description,
      iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/accommodation.svg",
    },
    {
      title: tips[4].title,
      description: tips[4].description,
      iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/companion.svg",
    },
  ];
};

// export const travelerInfoTips: { iconUrl: string; title: string; description: string }[] = [
//   {
//     title: "Hover the areas for info",
//     description: "If you close a field, we will provide you with relevant explanations.",
//     iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/default.svg",
//   },
//   {
//     title: "Travelers Number",
//     description: "Enter the amount of buddies you are visiting with.",
//     iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/traveler-numbers-profile.svg",
//   },
//   {
//     title: "Children Number",
//     description: "Enter the amount of buddies you are visiting with.",
//     iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/traveler-numbers-children.svg",
//   },
//   {
//     title: "Starting Point",
//     description: "Select your homebase address which you'll be staying at.",
//     iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/accommodation.svg",
//   },
//   {
//     title: "Companions",
//     description: "Select or create an individualized travel buddy you'll be visiting with.",
//     iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/companion.svg",
//   },
// ];

export const questionDefaultTip = ({ title, description }): { iconUrl: string; title: string; description: string } => {
  return {
    title,
    description,
    iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/default.svg",
  };
};

// export const questionDefaultTip = {
//   title: "Hover the areas for more info",
//   description: "If you close a field, we will provide you with relevant explanations.",
//   iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/default.svg",
// };
