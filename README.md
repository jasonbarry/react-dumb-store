# react-dumb-store

A small isomorphic state container for React that you can understand in 2 minutes.

## Motivation

All these state containers out there are such overkill. You need to learn all this termonology before you can even get started: actions, reducers, action creators... there's so much boilerplate (looking at you, Redux). 

Can't we make something <s>better</s> simpler? 

## Usage

### 0. Install

    yarn add react-dumb-store

### 1. Provide

```js
import React from 'react'
import App, { Container } from 'next/app'
import store, { StoreProvider } from 'react-dumb-store'

export default class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {}

    if (!store.get('name')) {
      const res = await fetch('https://api.npms.io/v2/search/suggestions?q=react')
      store.set({ name: res.data[0].package.name })
    }

    return { pageProps }
  }

  state = {
    store: store.get(),
  }

  componentDidMount() {
    store.observe(this.updateStore)
  }

  updateStore = () => {
    this.setState({ store: store.get() })
  }

  render() {
    const { Component, pageProps } = this.props

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

```js
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
import * as React from 'react'
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

Under the hood, this relies on React Context. You must be using React 16.3 or higher in order to use `react-dumb-store`.