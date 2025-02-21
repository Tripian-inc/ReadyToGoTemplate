/* eslint-disable react/require-default-props */

import React from "react";
import { ProgressAppLoading } from "@tripian/react";

const InitLoading: React.FC<{ message?: string }> = ({ message }) => (
  <ProgressAppLoading>
    {/* <h1>{message ? `${message}` : 'Welcome!'}</h1> */}
    {/*  <h1>{message ? `${message}` : "Loading..."}</h1> */}
    {""}
  </ProgressAppLoading>
);

export default InitLoading;
