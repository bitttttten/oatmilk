import { HTMLProps, ComponentType } from 'react'

export declare type TText = string
export declare type TRouteState = any
export declare type TRouteName = string
export declare type TRoutePath = string
export declare type TURL = string

export declare type THook = (route: IRoute, state: TRouteState) => Promise<void>

export declare type TDefaultHookCallee = (
    route: IRoute,
    state: any,
) => (hook: THook) => Promise<void>

export declare interface IRoute<Hook = THook> {
    name: TRouteName
    path: TRoutePath
    view: ComponentType
    onBeforeExit?: Hook
    onEnter?: Hook
}

export declare interface IData<Hook> {
    route: IRoute<Hook>
    state: TRouteState
}

export declare interface IProvider<HookCallee = TDefaultHookCallee, Hook = THook>
    extends HTMLProps<HTMLElement> {
    routes: IRoute<Hook>[]
    url?: TURL
    onBeforeExit?: Hook
    onEnter?: Hook
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
