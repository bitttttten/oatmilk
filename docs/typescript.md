# Typescript

### Work in progress

Make sure you reference the oatmilk library somewhere in a `.d.ts` file. With create-react-app, this should be `src/react-app-env.d.ts`. Or you should be able to import the types and use them from inside your codebase.

```js react-app-env.d.ts
/// <reference types="oatmilk" />
```

```js routes.tsx
import { IRoute } from 'oatmilk'

export const routes: IRoute[] = [
    {
        name: 'home',
        path: '/',
        view: () => <p>The world never says hello back..</p>,
    },
]
```

And that should be it!
