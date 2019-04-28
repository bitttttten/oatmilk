import React, { MouseEvent, useContext } from 'react'
import { Context } from './Router'
import { ILinkProps } from './types'

export default function Link({ onClick: onClickFromUser, children, ...props }: ILinkProps) {
    const { goTo } = useContext(Context)
    const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
		goTo(props.routeName, props.state)
		if (typeof onClickFromUser === 'function') {
			onClickFromUser(e)
		}
    }

    return (
        <a {...props} href={props.routeName} onClick={onClick}>
            {children}
        </a>
    )
}