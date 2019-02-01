import React from 'react'

const __STATE__ = '__DUMB__'
const isServer = typeof window === 'undefined'

class Store {
  constructor() {
    this.store = isServer ? {} : window[__STATE__]
  }

  get(key) {
    const store = isServer ? this.store : window[__STATE__]
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
      window[__STATE__] = this.store
    }
    // trigger callback function
    if (this.observer) {
      this.observer()
    }
  }

  observe(fn) {
    this.observer = fn
  }
}

const store = new Store()
export default store

export const hydrateStore = myStore => (
  <script dangerouslySetInnerHTML={{ __html: `window['${__STATE__}'] = ${JSON.stringify(myStore.get())}` }} />
)

// flow-disable-next-line
const Context = React.createContext()
export const StoreProvider = Context.Provider
export const StoreConsumer = Context.Consumer
