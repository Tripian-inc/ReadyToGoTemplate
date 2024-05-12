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

export const questionDefaultTip = ({ title, description }): { iconUrl: string; title: string; description: string } => {
  return {
    title,
    description,
    iconUrl: "https://poi-pics.s3.eu-west-1.amazonaws.com/General/icons/default.svg",
  };
};
