import 'jest-dom/extend-expect'
import React from 'react'
import {
    act,
    cleanup,
    fireEvent,
    render,
    waitForElement,
} from 'react-testing-library'
import { Link, Provider } from '../index'
import { RouterView } from '../RouterView'
import { IRoute } from '../types'
import { getRouteByName, getRouteFromUrl, getStateFromUrl } from '../utils'

afterEach(cleanup)

const homeRoute: IRoute = {
    name: 'home',
    path: '/',
    view: () => <p>this is the homepage</p>,
}

const userRoute: IRoute = {
    name: 'user',
    path: '/user/:id',
    view: () => <p>this is the user page</p>,
}

const notFoundRoute: IRoute = {
    name: 'notFound',
    path: '/404',
    view: () => <p>404</p>,
}

const routes: IRoute[] = [homeRoute, userRoute, notFoundRoute]

describe('<Link>', () => {
    test('renders link text content and attributes correctly', () => {
        const { getByText } = render(
            <Provider url='/' routes={routes}>
                <Link routeName='home'>link to home</Link>
                <Link routeName='user' state={{ id: 'bitttttten' }}>
                    link to bitttttten
                </Link>
                <Link routeName='notFound'>link to 404</Link>
            </Provider>,
        )
        expect(getByText(/link to home/)).toBeTruthy()
        expect(getByText(/link to bitttttten/).getAttribute('href')).toBe(
            '/user/bitttttten',
        )
        expect(getByText(/link to 404/)).toBeTruthy()
    })
    test('navigates from one view to another', async () => {
        const { getByText } = render(
            <Provider url='/' routes={routes}>
                <RouterView />
                <Link routeName='home'>link to home</Link>
                <Link routeName='user' state={{ id: 'bitttttten' }}>
                    link to bitttttten
                </Link>
            </Provider>,
        )
        expect(getByText(/this is the homepage/)).toBeTruthy()
        act(() => {
            fireEvent.click(getByText(/link to bitttttten/))
        })
        await waitForElement(() => getByText(/this is the user page/))
        act(() => {
            fireEvent.click(getByText(/link to home/))
        })
        await waitForElement(() => getByText(/this is the homepage/))
    })
    test('throws error with an invalid route', () => {
        expect(() => {
            render(
                <Provider url='/' routes={routes}>
                    <Link routeName='url-that-is-not-present'>broken link</Link>
                </Provider>,
            )
        }).toThrow()
    })
})

describe('Transition Hooks', () => {
    test('global hooks are called called', async () => {
        const onEnter = jest.fn()
        const onBeforeExit = jest.fn()
        const { getByText } = render(
            <Provider
                url='/'
                routes={routes}
                onEnter={onEnter}
                onBeforeExit={onBeforeExit}
            >
                <RouterView />
                <Link routeName='home'>link to home</Link>
                <Link routeName='user' state={{ id: 'bitttttten' }}>
                    link to bitttttten
                </Link>
            </Provider>,
        )
        expect(onEnter).toHaveBeenCalledTimes(1)
        expect(onBeforeExit).toHaveBeenCalledTimes(0)
        act(() => {
            fireEvent.click(getByText(/link to bitttttten/))
        })
        await waitForElement(() => getByText(/this is the user page/))
        expect(onEnter).toHaveBeenCalledTimes(2)
        expect(onBeforeExit).toHaveBeenCalledTimes(1)
        act(() => {
            fireEvent.click(getByText(/link to home/))
        })
        await waitForElement(() => getByText(/this is the homepage/))
        expect(onEnter).toHaveBeenCalledTimes(3)
        expect(onBeforeExit).toHaveBeenCalledTimes(2)
    })
    test('route hooks are called properly', async () => {
        const homeRouteWithHooks = {
            ...homeRoute,
            onEnter: jest.fn(),
            onBeforeExit: jest.fn(),
        }
        const userRouteWithHooks = {
            ...userRoute,
            onEnter: jest.fn(),
            onBeforeExit: jest.fn(),
        }
        const notFoundWithHooks = {
            ...notFoundRoute,
            onEnter: jest.fn(),
            onBeforeExit: jest.fn(),
        }
        const routes: IRoute[] = [
            homeRouteWithHooks,
            userRouteWithHooks,
            notFoundWithHooks,
        ]
        const { getByText } = render(
            <Provider url='/' routes={routes}>
                <RouterView />
                <Link routeName='home'>link to home</Link>
                <Link routeName='user' state={{ id: 'bitttttten' }}>
                    link to bitttttten
                </Link>
                <Link routeName='notFound'>link to 404 page</Link>
            </Provider>,
        )
        expect(homeRouteWithHooks.onEnter).toHaveBeenCalledTimes(1)
        expect(userRouteWithHooks.onEnter).toHaveBeenCalledTimes(0)
        expect(notFoundWithHooks.onEnter).toHaveBeenCalledTimes(0)
        expect(homeRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(0)
        expect(userRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(0)
        expect(notFoundWithHooks.onBeforeExit).toHaveBeenCalledTimes(0)

        act(() => {
            fireEvent.click(getByText(/link to bitttttten/))
        })
        await waitForElement(() => getByText(/this is the user page/))

        expect(homeRouteWithHooks.onEnter).toHaveBeenCalledTimes(1)
        expect(userRouteWithHooks.onEnter).toHaveBeenCalledTimes(1)
        expect(notFoundWithHooks.onEnter).toHaveBeenCalledTimes(0)
        expect(homeRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(1)
        expect(userRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(0)
        expect(notFoundWithHooks.onBeforeExit).toHaveBeenCalledTimes(0)

        act(() => {
            fireEvent.click(getByText(/link to home/))
        })
        await waitForElement(() => getByText(/this is the homepage/))

        expect(homeRouteWithHooks.onEnter).toHaveBeenCalledTimes(2)
        expect(userRouteWithHooks.onEnter).toHaveBeenCalledTimes(1)
        expect(notFoundWithHooks.onEnter).toHaveBeenCalledTimes(0)
        expect(homeRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(1)
        expect(userRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(1)
        expect(notFoundWithHooks.onBeforeExit).toHaveBeenCalledTimes(0)

        act(() => {
            fireEvent.click(getByText(/link to 404 page/))
        })
        await waitForElement(() => getByText(/this is the homepage/))

        expect(homeRouteWithHooks.onEnter).toHaveBeenCalledTimes(2)
        expect(userRouteWithHooks.onEnter).toHaveBeenCalledTimes(1)
        expect(notFoundWithHooks.onEnter).toHaveBeenCalledTimes(1)
        expect(homeRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(2)
        expect(userRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(1)
        expect(notFoundWithHooks.onBeforeExit).toHaveBeenCalledTimes(0)
    })
})

describe('getRouteFromUrl', () => {
    test('finds `home` route from `/`', () => {
        expect(getRouteFromUrl(routes, '/')).toEqual(homeRoute)
    })
    test('finds `notFound` route from `/404`', () => {
        expect(getRouteFromUrl(routes, '/404')).toEqual(notFoundRoute)
    })
    test('returns `notFound` route from `/url-that-is-not-present`', () => {
        expect(getRouteFromUrl(routes, '/url-that-is-not-present')).toEqual(
            notFoundRoute,
        )
    })
})

describe('getRouteByName', () => {
    test('finds `home` route', () => {
        expect(getRouteByName(routes, 'home')).toEqual(homeRoute)
    })
    test('finds `notFound` route from `/404`', () => {
        expect(getRouteByName(routes, 'notFound')).toEqual(notFoundRoute)
    })
    test('returns undefined from `/url-that-is-not-present`', () => {
        expect(getRouteByName(routes, '/')).toEqual(undefined)
    })
})

describe('getStateFromUrl', () => {
    test('returns empty object for route with no special cases', () => {
        expect(getStateFromUrl('/', '/')).toEqual({})
    })
    test('returns an object with `id` of `bitttttten` in the user route', () => {
        expect(getStateFromUrl('/user/:id', '/user/bitttttten')).toEqual({
            id: 'bitttttten',
        })
    })
})
