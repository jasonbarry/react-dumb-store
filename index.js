import React from 'react'

const __STORE__ = '__STORE__'
const isServer = typeof window === 'undefined'

class Store {
  constructor() {
    this.store = isServer ? {} : window[__STORE__] || {}
  }

  get(key) {
    const store = isServer ? this.store : window[__STORE__] || {}
    // if no key is passed, return whole store
    return key ? store[key] : store
  }

  set(obj) {
    // merge obj with existing store
    this.store = {
      ...this.get(),
      ...obj,
    }
    // update global on the client
    if (!isServer) {
      window[__STORE__] = this.store
    }
    // trigger callback function
    if (this.observer) {
      this.observer()
    }
  }

  observe(fn) {
    this.observer = fn
  }

  // intended to be called by `hydrateStore` only
  // only call this clientside if you know what you're doing
  reset() {
    this.store = {}
  }
}

const store = new Store()
export default store

export const hydrateStore = () => {
  const hydration = JSON.stringify(store.get())
  // reset the store so that the server doesn't persist global values
  store.reset();
  return(
    <script dangerouslySetInnerHTML={{ __html: `window['${__STORE__}'] = ${hydration}` }} />
  )
}

const Context = React.createContext()
export const StoreProvider = Context.Provider
export const StoreConsumer = Context.Consumer
