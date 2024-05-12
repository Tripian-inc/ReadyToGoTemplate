import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { QrReader } from "react-qr-reader";
import { OFFER_PAYMENT, QR_READER } from "../../constants/ROUTER_PATH_TITLE";
import useTranslate from "../../hooks/useTranslate";
import classes from "./QrReaderPage.module.scss";

const QrReaderPage = () => {
  const [url, setUrl] = useState<string | undefined>();

  const { t } = useTranslate();

  const history = useHistory();
  document.title = QR_READER.TITLE(t("qrReader.header"));

  useEffect(() => {
    console.log(url);
    if (url) {
      if (url.includes(OFFER_PAYMENT.PATH)) {
        const startIndex = url.indexOf(OFFER_PAYMENT.PATH) + 15;
        const offerId = url.substring(startIndex);
        history.replace(`${OFFER_PAYMENT.PATH}/${offerId}`);
        // window.location.href = url;
      } else {
        history.goBack();
      }
    }
  }, [history, url]);

  return (
    <div className={classes.qrReader}>
      <QrReader
        constraints={{ facingMode: "environment" }}
        onResult={(result, error) => {
          if (!!result) {
            setUrl(result?.getText());
          }

          if (!!error) {
            console.info(error);
          }
        }}
        videoContainerStyle={{ width: "100%", height: "100%", paddingTop: "0" }}
        containerStyle={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default QrReaderPage;
