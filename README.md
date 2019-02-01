# react-dumb-store

A small isomorphic state container for React that you can understand in 2 minutes.

## Features

- Works on server and client (SSR-friendly)
- Updates to the store trigger updates to the DOM
- Caches store values in memory
- [0 dependencies, 2.7KB minified, 1.1KB gzipped](https://bundlephobia.com/result?p=react-dumb-store)


## Motivation

All these state containers out there are such overkill. You need to learn all this termonology before you can even get started: actions, reducers, action creators... there's so much boilerplate (looking at you, Redux). 

Can't we make something <s>better</s> simpler? 

> **Note:** This package doesn't include any functionality regarding middleware, time-traveling devtools, or other features that you might find in other state container packages. It is meant only to persist values universally in a global store, and to easily update those values, and nothing more (**hence "dumb"**).

## Usage

### 0. Install

    yarn add react-dumb-store

### 1. Provide

We'll use Next.js's convention of `_app.js` to illustrate wrapping your app in the `StoreProvider` component. Most importantly, you need to initialize the store in state, and pass a function that updates state to `store.observe` (either in your render function, or in `componentDidMount`).

```js
// _app.js
import React from 'react'
import App, { Container } from 'next/app'
import store, { StoreProvider } from 'react-dumb-store'

export default class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {}

    // example server-side fetch that occurs once during client-side navigation
    if (!store.get('name')) {
      const res = await fetch('https://api.npms.io/v2/search/suggestions?q=react')
      store.set({ name: res.json()[0].package.name })
    }

    return { pageProps }
  }

  state = {
    // initialize the store in state
    store: store.get(),
  }

  updateStore = () => {
    this.setState({ store: store.get() })
  }

  render() {
    const { Component, pageProps } = this.props
    
    // sets a function to run after `store.set()` is called
    store.observe(this.updateStore)
    
    return (
      <Container>
        <StoreProvider value={this.state.store}>
          <Component {...pageProps} />
        </StoreProvider>
      </Container>
    )
  }
}
```

### 2. Consume

Wrap the `StoreConsumer` component around wherever you'd like to use a value from the store.

```js
// DeeplyNestedChildComponent.js
import React from 'react'
import store, { StoreConsumer } from 'react-dumb-store'

const changeName = () => {
  store.set({
    name: 'Quincy Jones',
  })
}

const DeeplyNestedChildComponent = () => (
  <StoreConsumer>
    {({ name }) => (
      <p>Hi {name}!</p>
      <button onClick={changeName}>Change name</button>
    )}
  </StoreConsumer>
)

export default DeeplyNestedChildComponent
```

### 3. Hydrate (optional)

If you're rendering your markup server-side (like with Next.js), you'll need to hydrate your client so that you avoid a duplicate fetch and that the store can get passed from the server to client. Here we'll edit `_document.js`:

```js
// _document.js
import React from 'react'
import Document, { Main, NextScript } from 'next/document'
import store, { hydrateStore } from 'react-dumb-store'

export default class extends Document {
  static getInitialProps({ renderPage }) {
    const page = renderPage()
    const storeHydration = hydrateStore(store)
    return { ...page, storeHydration }
  }

  render() {
    return (
      <html>
        <body>
          <Main />
          {this.props.storeHydration}
          <NextScript />
        </body>
      </html>
    )
  }
}

```

## Behind the scenes

Under the hood, this relies on React Context. You must use React 16.3 or higher in order to use `react-dumb-store`.