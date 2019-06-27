import { HTMLProps, ComponentType } from 'react'

export type TText = string
export type TRouteState = any
export type TRouteName = string
export type TRoutePath = string
export type TURL = string
export type TQuery = { [key: string]: string }
export type TQueryString = string

export type THook = (route: IRoute, state: TRouteState) => Promise<void>

export type TDefaultHookCallee = (
    route: IRoute,
    state: any,
) => (hook: THook) => Promise<void>

export interface IRoute<Hook = THook> {
    name: TRouteName
    path: TRoutePath
    view: ComponentType
    onBeforeExit?: Hook
    onEnter?: Hook
}

export interface IData<Hook> {
    route: IRoute<Hook>
    state: TRouteState
    query: TQuery
}

export interface IProvider<HookCallee = TDefaultHookCallee, Hook = THook>
    extends HTMLProps<HTMLElement> {
    routes: IRoute<Hook>[]
    queryString?: TQueryString
    url?: TURL
    onBeforeExit?: Hook
    onEnter?: Hook
    hookCallee?: HookCallee
}

export interface IContext {
    goTo: (toRouteName: TRouteName, toState?: TRouteState) => void
    getHref: (routeName: string, state?: TRouteState) => string
    route: {
		name: TRouteName
		path: TRoutePath
		view: ComponentType
    }
    query: TQuery
    state: TRouteState
}

export interface ILinkProps
    extends Pick<
        HTMLProps<HTMLAnchorElement>,
        Exclude<keyof HTMLProps<HTMLAnchorElement>, 'href'>
    > {
    routeName: TRouteName
    state?: TRouteState
}
