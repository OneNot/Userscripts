// ==UserScript==
// @name        waitForKeyElement
// @license     MIT
// @namespace   1N07
// @match       *://*/*
// @version     1.0
// @author      1N07
// @description Library that Exports a single function: WaitForKeyElement, which returns a Promise that resolves to an element by given selector, when that element excists
// ==/UserScript==

async function WaitForKeyElement(selector, timeout) {
    return new Promise((resolve, reject) => {
      let el = document.querySelector(selector);

      if(el) {
        resolve(el);
        return;
      }

      new MutationObserver((mutationRecords, observer) => {
        el = document.querySelector(selector);
        if(el) {
          resolve(el);
          observer.disconnect();
        }
      }).observe(document.documentElement, { childList: true, subtree: true});

      if(timeout) {
        setTimeout(() => { reject(null) }, timeout);
      }
    });
  }