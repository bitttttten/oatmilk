import React, { forwardRef, MouseEvent } from 'react'
import { useOatmilk } from './hooks'
import { ILinkProps } from './types'

const Link = forwardRef<HTMLAnchorElement, ILinkProps>(
    (
        {
            onClick: onClickFromUser,
            children,
            queryParams,
            routeName,
            state,
            prefix = '',
            suffix = '',
            ...props
        },
        ref,
    ) => {
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
                goTo(routeName, state, queryParams, prefix)
            }
        }

        const href = `${prefix}${getHref(
            routeName,
            state,
            queryParams,
        )}${suffix}`.trim()

        return (
            <a {...props} href={href} ref={ref} onClick={onClick}>
                {children}
            </a>
        )
    },
)

export { Link }
