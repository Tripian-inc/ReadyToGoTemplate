interface IRouteProps {
  PATH: string;
  TITLE: (value?: string) => string;
  HEADER?: (value?: string) => string;
}

export default IRouteProps;
