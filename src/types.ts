import { HTMLProps, ComponentType } from 'react'

export declare type TText = string
export declare type TRouteState = any
export declare type TRouteName = string
export declare type TRoutePath = string
export declare type TURL = string

export declare type THook = (
    route: IRoute,
    state: TRouteState,
) => Promise<void>

export declare type TDefaultHookCallee = (
    route: IRoute,
    state: TRouteState,
) => (hook: THook) => Promise<void>

export declare interface IRoute {
    name: TRouteName
    path: TRoutePath
    view: ComponentType
    onBeforeExit?: THook
    onEnter?: THook
}

export declare interface IData {
    route: IRoute
    state: TRouteState
}

export declare interface IProvider<HookCallee = TDefaultHookCallee> extends HTMLProps<HTMLElement> {
    routes: IRoute[]
    url?: TURL
    onBeforeExit?: THook
    onEnter?: THook
    hookCallee?: HookCallee
}

export declare interface IContext {
    goTo: (toRouteName: TRouteName, toState?: TRouteState) => void
    getHref: (routeName: string, state?: TRouteState) => string
    route: IRoute
    state: TRouteState
}

export declare interface ILinkProps
    extends Pick<
        HTMLProps<HTMLAnchorElement>,
        Exclude<keyof HTMLProps<HTMLAnchorElement>, 'href'>
    > {
    routeName: TRouteName
    state?: TRouteState
}
