// ==UserScript==
// @name        Show Rottentomatoes meter - Trakt UI Addon
// @description This is an addon script for "Show Rottentomatoes meter" by cuzi, that displays the Rottentomatoes info cleanly on the trakt.tv infobar
// @namespace   1N07
// @author      1N07
// @license     MIT
// @icon        https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/72x72/1F345.png
// @version     48.1.0
// @match       https://trakt.tv/movies/*
// @match       https://trakt.tv/shows/*
// @require     https://raw.githubusercontent.com/OneNot/Userscripts/main/Libraries/WaitForKeyElement/index.js
// @run-at      document-body
// ==/UserScript==

(async function () {
  WaitForKeyElement(`
      .shows.show #summary-ratings-wrapper .ratings,
      .movies.show #summary-ratings-wrapper .ratings
  `).then(insertLocation => {
    console.log(insertLocation);
    console.log(insertLocation.className);
    WaitForKeyElement("#mcdiv321rotten > .firstResult").then(rottenEl => {
      console.log(rottenEl);
      console.log(rottenEl.className);
      console.log(rottenEl.querySelector("[title^='Critics']").getAttribute("title"));
    });
  });
})()
