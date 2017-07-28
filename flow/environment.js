//@flow

declare var ROUTE_PREFIX: string;
declare var BMap: Object;

// temporary patches for React.Component and React.Element
declare var ReactComponent: typeof React$Component;
declare var ReactElement: typeof React$Element;

declare type RouterConfig = {
  children: { name?: string, path: string, component: ReactElement<any> | JSX.Element }[],
  image: ReactElement<{| className: string, style?: Object |} >,
    name: string,
}[];
/*declare module 'redux-actions'{
  declare type ActionType = string;

  declare type Action<P> = {
    type: ActionType,
    payload ? : P,
    error ? : bool,
    meta ? : any,
  }; 

  declare function createAction<T,P>(
    type : ActionType,
    payloadCreator ? : (...args:Array<T>) => P,
    metaCreator ? : Function
  ):(...args:Array<T>)=>Action<P>
}*/