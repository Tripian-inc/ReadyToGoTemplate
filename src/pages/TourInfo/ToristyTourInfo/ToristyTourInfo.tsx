/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState, useEffect, useCallback } from "react";
import Model from "@tripian/model";
import useToristyInfo from "../../../hooks/useToristyInfo";
import { useHistory } from "react-router";
import AppNav from "../../../App/AppNav/AppNav";
import { Button, PreLoading, SvgIcons } from "@tripian/react";
import { TOUR_INFO } from "../../../constants/ROUTER_PATH_TITLE";
import ImageGallery from "./ImageGallery/ImageGallery";
import ImageSlider from "./ImageSlider/ImageSlider";

interface IToristyTourInfo {
  tourId: string;
  t: (value: Model.TranslationKey) => string;
}

const ToristyTourInfo: React.FC<IToristyTourInfo> = ({ tourId, t }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const { fetchToristyInfo, toristyInfo, loadingToristyInfo } = useToristyInfo();

  const history = useHistory();

  useEffect(() => {
    fetchToristyInfo(tourId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = "auto";
  };

  const nextGalleryImage = useCallback(() => {
    setGalleryIndex((prev) => (prev + 1) % (toristyInfo?.service?.images?.length ?? 1));
  }, [toristyInfo?.service?.images?.length]);

  const prevGalleryImage = useCallback(() => {
    setGalleryIndex((prev) => (prev - 1 + (toristyInfo?.service?.images?.length ?? 1)) % (toristyInfo?.service?.images?.length ?? 1));
  }, [toristyInfo?.service?.images?.length]);

  if (loadingToristyInfo) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <PreLoading />
      </>
    );
  }
  if (toristyInfo === undefined) {
    return (
      <>
        <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
        <div className="mt-12 mx-auto p-4 text-center">Your platform does not support "Toristy" tours.</div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AppNav header={TOUR_INFO.HEADER?.(t("tourInfo.header"))} />
      {/* Hero Section with Image Carousel */}
      <div className="container mx-auto px-4 py-12 relative">
        <ImageSlider images={toristyInfo.service.images} title={toristyInfo.service.name} goBack={() => history.goBack()} onImageClick={openGallery} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Tour Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Info */}
              <div className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-4">
                  <SvgIcons.Tags width="24" height="24" fill="var(--primary-color)" />
                  <div>
                    <p className="text-sm text-gray-600">Service Type</p>
                    <p className="font-semibold">{toristyInfo.service.serviceType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <SvgIcons.MapPin width="24" height="24" fill="var(--primary-color)" />
                  <div>
                    <p className="text-sm text-gray-600">Starting Point</p>
                    <p className="font-semibold">{toristyInfo.service.location.line1 || toristyInfo.service.location.line2}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <SvgIcons.Euro width="24" height="24" fill="var(--primary-color)" />
                  <div>
                    <p className="text-sm text-gray-600">From</p>
                    <p className="font-semibold" dangerouslySetInnerHTML={{ __html: toristyInfo.service.starting_price.text }} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">About This Tour</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: toristyInfo.service.description }} />
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {toristyInfo?.service?.images.map((image, index) => (
                    <div key={index} onClick={() => openGallery(index)} className="relative group cursor-pointer overflow-hidden rounded-xl">
                      <img src={image.orig} alt={`Tour image ${index + 1}`} className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-sm font-medium">View Image</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Booking Info */}
            <div className="space-y-8">
              {/* Booking Card */}
              <div className="bg-white rounded-2xl shadow-lg p-4 border sticky top-8">
                <div className="bg-white p-4">
                  <h3 className="text-xl font-semibold mb-4">What's Included</h3>
                  {/* Included */}
                  <ul className="text-gray-600 text-base">
                    {toristyInfo?.service?.included?.split("<br />").map((item, index) => (
                      <li key={index} className="flex items-start mb-2">
                        {/* <Check className="w-5 h-5 text-green-500 mr-2 mt-[0.125rem]" /> */}
                        <SvgIcons.Check2 fill="#22c55e" width="24" height="24" className="mr-2 mt-[0.125rem]" />
                        <span className="w-[calc(100%-2rem)]" dangerouslySetInnerHTML={{ __html: item.trim() }} />
                      </li>
                    ))}
                  </ul>
                  {/* Excluded */}
                  <ul className="text-gray-600 text-base">
                    {toristyInfo?.service?.excluded?.split("<br />").map((item, index) => (
                      <li key={index} className="flex items-start mb-2">
                        <SvgIcons.X fill="#ef4444" width="24" height="24" className="mr-2 mt-[0.125rem]" />
                        <span className="w-[calc(100%-2rem)]" dangerouslySetInnerHTML={{ __html: item.trim() }} />
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Important Info */}
                <div className="bg-white p-4">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <SvgIcons.Info size="20" className="mr-2" />
                    Important Information
                  </h3>
                  <div
                    className="space-y-2 text-gray-600 text-base [&_ul]:list-disc [&_ul]:pl-5 [&_li+li]:mt-2"
                    dangerouslySetInnerHTML={{ __html: toristyInfo.service.attention }}
                  />
                </div>
                <Button
                  color="primary"
                  className="w-full"
                  onClick={() => {
                    window.open(toristyInfo.fullinformationbookinglink, "_blank");
                  }}
                  text="BOOK NOW"
                />
              </div>
            </div>
          </div>
        </div>

        <ImageGallery
          images={toristyInfo.service.images}
          isOpen={isGalleryOpen}
          currentIndex={galleryIndex}
          onClose={closeGallery}
          onChangeIndex={setGalleryIndex}
          onNext={nextGalleryImage}
          onPrev={prevGalleryImage}
        />
      </div>
    </div>
  );
};

export default ToristyTourInfo;
