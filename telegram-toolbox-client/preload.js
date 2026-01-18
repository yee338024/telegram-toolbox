'use strict'
const { contextBridge, ipcRenderer } = require('electron')
// const {join} = require("path");

const listeners = {}
// const preloadPath = "file://" + join(__dirname, 'preload.js');
contextBridge.exposeInMainWorld('electronAPI', {
  // logger: log,
  platform: process.platform,
  isMas: process.mas === true,
  invoke: async (channel, ...args) => {
    return await ipcRenderer.invoke(channel, ...args)
  },
  sendIpc: (key, ...args) => {
    ipcRenderer.send(key, ...args)
  },
  addIpcListener: (key, fn) => {
    const saferFn = (event, ...args) => fn(...args)
    // Deliberately strip event as it includes `sender`
    // log.debug('Add listener with key: ' + key);
    ipcRenderer.on(key, saferFn)
    listeners[key] = saferFn
  },
  removeIpcListener: (key) => {
    // log.debug('Remove listener with key: ' + key);
    const fn = listeners[key]
    if (fn) {
      ipcRenderer.removeListener(key, fn)
    }
    delete listeners[key]
  },
})
// window.Sentry = Sentry;
