import React, { MouseEvent } from 'react'
import { useOatmilk } from './hooks'
import { ILinkProps } from './types'

export function Link({
    onClick: onClickFromUser,
    children,
    routeName,
    state,
    ...props
}: ILinkProps) {
    const { goTo, getHref } = useOatmilk()

	const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        goTo(routeName, state)
        if (typeof onClickFromUser === 'function') {
            onClickFromUser(e)
        }
    }
    const href = getHref(routeName, state)

    return (
        <a {...props} href={href} onClick={onClick}>
            {children}
        </a>
    )
}