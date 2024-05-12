import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

interface LoginRouteProps extends RouteProps {
  component: any;
  setLoggedIn: Function;
}

const LoginRoute: React.FC<LoginRouteProps> = ({ component: Component, setLoggedIn, ...rest }) => {
  return (
    <Route
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      render={(routeProps) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Component setLoggedIn={setLoggedIn} {...routeProps} />
      )}
    />
  );
};

export default LoginRoute;
