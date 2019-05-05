# Using oatmilk's Context

oatmilk's was written with the intent to be simple, and flexible. In regards to state, it has no API of it's own as under the hood it uses context, so if you are looking to customise your app per-route you are encouraged to use the context and derive your view from the state inside it.

For example, if you wanted to build on top of `RouterView` you can do it really easily. Or if, for some reason, you wanted to change the background colour of your navbar depending on the route, it's quite simple too:

```js Navbar.tsx
import React, { useContext } from 'react'
import oatmilk, { Link, TRouteName } from 'oatmilk'

function getColour(routeName: TRouteName | null) {
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
        <div css={{ backgroundColor: getColour(route ? route.name : null) }}>
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
