# Using oatmilk's Context

oatmilk's was written with the intent to be simple and flexible. It uses React's Context API which is exported as `oatmilk.Context` so you are encouraged to use it.

For example, if you wanted to build on top of `RouterView` you can do it really easily. Or if, for some reason, you wanted to change the background colour of your navbar depending on the route, it's quite simple too:

```js Navbar.tsx
import React, { useContext } from 'react'
import oatmilk, { Link, TRouteName } from 'oatmilk'

function getColour(routeName: TRouteName) {
    switch (routeName) {
        case 'home':
            return 'tomato'
        case 'users':
            return 'redbeccapurple'
        default:
            return 'orange'
    }
}

export default function NavBar() {
    const { route } = useContext(oatmilk.Context)

    return (
        <div css={{ backgroundColor: getColour(route.name) }}>
            <Link routeName='home'>
                <IconHome /> Home
            </Link>
            <Link routeName='users'>
                <IconUsers /> Users
            </Link>
            <Link routeName='settings'>
                <IconSettings /> Settings
            </Link>
        </div>
    )
}
```
