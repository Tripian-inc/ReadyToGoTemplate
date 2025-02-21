import React from "react";
import { api } from "@tripian/core";

class ErrorHandling {
  private static redirectToHome = (resetErrorBoundary: () => void) => {
    setTimeout(() => {
      window.location.href = window.location.origin;
      resetErrorBoundary();
    }, 5000);
  };

  static myErrorHandler = (error: Error, info: React.ErrorInfo) => {
    // Do something with the error
    // E.g. log to an error logging client here
    const logMessage = `ErrorHandling: ${error.message}`;
    const errorDataPayload = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    const infoComponentStack = info.componentStack?.toString();
    errorDataPayload.infoComponentStack = infoComponentStack;

    console.log("Error", logMessage, errorDataPayload);

    try {
      if (api && window.location.hostname !== "localhost") api.log(logMessage, errorDataPayload);
    } catch {}
  };

  static ErrorFallback = ({ error, resetErrorBoundary }) => {
    this.redirectToHome(resetErrorBoundary);

    return (
      <div className="container center pt12">
        <p className="font-bold">Something went wrong, we are sorry for this &#128533;</p>
        <p className="font-bold">We got the error details and will fix it ASAP.</p>
        <br />
        <p className="font-bold">You are being redirected to the home page...</p>
      </div>
    );
  };

  /* 
  myErrorHandler = (error, info) => {
    // Do something with the error
    // E.g. log to an error logging client here
    console.log(`Error: ${error}. Info:`);
    console.log(info);
  };

  ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
      <>
        <p>Something went wrong:</p>
        <pre>{error.message}</pre>
        <button onClick={resetErrorBoundary}>Try again</button>
      </>
    );
  }; */
}

export default ErrorHandling;
