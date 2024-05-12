import React from "react";
import { useSelector } from "react-redux";
import { Route, Redirect, RouteProps } from "react-router-dom";
import ICombinedState from "../../../redux/model/ICombinedState";
import { LOGIN } from "../../../constants/ROUTER_PATH_TITLE";

interface PrivateRouteProps extends RouteProps {
  component: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const isLoggedIn = useSelector((state: ICombinedState) => state.user.isLoggedIn);

  return (
    <Route
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      render={(routeProps) =>
        isLoggedIn ? (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Component {...routeProps} />
        ) : (
          <Redirect
            to={{
              pathname: LOGIN.PATH,
              state: { from: routeProps.location.pathname },
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
