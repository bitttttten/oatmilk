import { HTMLProps, ComponentType } from "react"

export declare type TText = string
export declare type TRouteState = object
export declare type TRouteName = string
export declare type TRoutePath = string
export declare type TURL = string

export declare interface IRoute {
	name: TRouteName
	path: TRoutePath
	view: ComponentType
}

export declare interface PRouterProvider extends HTMLProps<HTMLElement> {
	routes: IRoute[],
	url?: TURL
}

export declare interface IRouterContext {
	goTo: (toRouteName: TRouteName, toState: TRouteState) => void
	route: IRoute
	state: TRouteState
}

export declare interface ILinkProps extends Omit<HTMLProps<HTMLAnchorElement>, "href"> {
    routeName: IRoute['name']
    state?: TRouteState
}