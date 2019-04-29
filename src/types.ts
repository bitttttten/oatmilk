import { HTMLProps, ComponentType } from 'react'

export declare type TText = string
export declare type TRouteState = any
export declare type TRouteName = string
export declare type TRoutePath = string
export declare type TURL = string

export declare type THookWithReducer<T> = (toRoute: IRoute, toState: TRouteState, ...T: any[]) => Promise<void>
export declare type THook = (toRoute: IRoute, toState: TRouteState) => Promise<void>

export declare interface IRoute<T = any> {
	name: TRouteName
	path: TRoutePath
	view: ComponentType
	onBeforeExit?: THook
	onEnter?: THookWithReducer<T>
}

export declare interface IData {
	route: IRoute
	state: TRouteState
}

export declare interface IProvider<T = any> extends HTMLProps<HTMLElement> {
	routes: IRoute[],
	url?: TURL,
	onBeforeExit?: THook
	onEnter?: THook
	hookReducer?: THookWithReducer<T>
}

export declare interface IContext {
	goTo: (toRouteName: TRouteName, toState?: TRouteState) => void
    getHref: (routeName: string, state?: TRouteState) => string
	route: IRoute
	state: TRouteState
}

export declare interface ILinkProps extends Pick<HTMLProps<HTMLAnchorElement>, Exclude<keyof HTMLProps<HTMLAnchorElement>, 'href'>> {
	routeName: IRoute['name']
	state?: TRouteState
}