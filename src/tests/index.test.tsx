import 'jest-dom/extend-expect'
import React, { Fragment } from 'react'
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
import {
    getRouteByName,
    getRouteFromUrl,
    getStateFromUrl,
    parseQueryStringIntoObject,
    parseObjectIntoQueryString,
} from '../utils'
import { useOatmilk } from '../hooks'

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
    test('renders urls correctly', async () => {
        const { getByText } = render(
            <Provider url='/' routes={routes}>
                <RouterView />
                <Link routeName='home'>link to home</Link>
                <Link routeName='user' state={{ id: 'bitttttten' }}>
                    link to bitttttten
                </Link>
                <Link
                    routeName='user'
                    state={{ id: 'soulpicks' }}
                    queryParams={{
                        queryParamsTest: true,
                        'url-with-dashes': 'it-is-successful',
                    }}
                >
                    link to soulpicks
                </Link>
            </Provider>,
        )
        expect(getByText(/link to home/).getAttribute('href')).toBe('/')
        expect(getByText(/link to bitttttten/).getAttribute('href')).toBe(
            '/user/bitttttten',
        )
        expect(getByText(/link to soulpicks/).getAttribute('href')).toBe(
            '/user/soulpicks?queryParamsTest=true&url-with-dashes=it-is-successful',
        )
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
    test('query params match', async () => {
        function Component() {
            const { queryParams } = useOatmilk()
            return (
                <Fragment>
                    <p>Name is {queryParams.name}</p>
                    <p>Library is {queryParams.library}</p>
                </Fragment>
            )
        }
        const routes = [
            {
                name: 'home',
                path: '/',
                view: Component,
            },
        ]
        const { getByText } = render(
            <Provider
                url='/'
                queryString='name=bitttttten&library=oatmilk'
                routes={routes}
            >
                <RouterView />
            </Provider>,
        )
        expect(getByText(/Name is bitttttten/)).toBeTruthy()
        expect(getByText(/Library is oatmilk/)).toBeTruthy()
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
    test('to and from routes, with and without hooks', async () => {
        const homeRouteWithHooks = {
            ...homeRoute,
            onEnter: jest.fn(),
            onBeforeExit: jest.fn(),
        }
        const userRouteWithOutHooks = {
            ...userRoute,
        }
        const notFoundWithoutHooks = {
            ...notFoundRoute,
        }
        const routes: IRoute[] = [
            homeRouteWithHooks,
            userRouteWithOutHooks,
            notFoundWithoutHooks,
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
        expect(homeRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(0)

        act(() => {
            fireEvent.click(getByText(/link to bitttttten/))
        })
        await waitForElement(() => getByText(/this is the user page/))

        expect(homeRouteWithHooks.onEnter).toHaveBeenCalledTimes(1)
        expect(homeRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(1)

        act(() => {
            fireEvent.click(getByText(/link to home/))
        })
        await waitForElement(() => getByText(/this is the homepage/))

        expect(homeRouteWithHooks.onEnter).toHaveBeenCalledTimes(2)
        expect(homeRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(1)

        act(() => {
            fireEvent.click(getByText(/link to 404 page/))
        })
        await waitForElement(() => getByText(/this is the homepage/))

        expect(homeRouteWithHooks.onEnter).toHaveBeenCalledTimes(2)
        expect(homeRouteWithHooks.onBeforeExit).toHaveBeenCalledTimes(2)
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

describe('parseQueryStringIntoObject', () => {
    test('returns empty object when passed no query string', () => {
        expect(parseQueryStringIntoObject()).toEqual({})
        expect(parseQueryStringIntoObject('')).toEqual({})
        // @ts-ignore
        expect(parseQueryStringIntoObject(() => {})).toEqual({})
        // @ts-ignore
        expect(parseQueryStringIntoObject({ test: true })).toEqual({})
    })
    test('returns expected', () => {
        expect(
            parseQueryStringIntoObject(
                'test=true&oatmilk=true&thisshouldbe=successful',
            ),
        ).toEqual({
            test: 'true',
            oatmilk: 'true',
            thisshouldbe: 'successful',
        })
    })
})

describe('parseObjectIntoQueryString', () => {
    test('returns empty string when sent no object', () => {
        expect(parseObjectIntoQueryString()).toEqual('')
        // @ts-ignore
        expect(parseObjectIntoQueryString('')).toEqual('')
        // @ts-ignore
        expect(parseObjectIntoQueryString(() => {})).toEqual('')
    })
    test('returns empty with no object', () => {
        expect(parseObjectIntoQueryString({})).toEqual('')
    })
    test('returns expected', () => {
        expect(
            parseObjectIntoQueryString({
                test: true,
                oatmilk: 'true',
                thisshouldbe: 'successful',
                alphabeticalOrder: 'does-not-matter',
            }),
        ).toEqual(
            '?test=true&oatmilk=true&thisshouldbe=successful&alphabeticalOrder=does-not-matter',
        )
    })
})
