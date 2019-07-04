import React, { MouseEvent } from 'react'
import { useOatmilk } from './hooks'
import { ILinkProps } from './types'

export function Link({
    onClick: onClickFromUser,
    children,
    queryParams,
    routeName,
    state,
    ...props
}: ILinkProps) {
    const { goTo, getHref } = useOatmilk()

    const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
        if (typeof onClickFromUser === 'function') {
            onClickFromUser(e)
        }
        if (
            e.button === 0 && // ignore right clicks
            !props.target && // let browser handle "target=_blank"
            !e.defaultPrevented && // onClick prevented default
            !e.metaKey && // ignore clicks with modifier keys...
            !e.altKey &&
            !e.ctrlKey &&
            !e.shiftKey
        ) {
            e.preventDefault()
            goTo(routeName, state, queryParams)
        }
    }
    const href = getHref(routeName, state, queryParams)

    return (
        <a {...props} href={href} onClick={onClick}>
            {children}
        </a>
    )
}
