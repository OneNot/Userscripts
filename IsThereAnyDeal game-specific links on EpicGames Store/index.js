// ==UserScript==
// @name         IsThereAnyDeal game-specific links on EpicGames Store
// @namespace    1N07
// @version      0.9.0
// @description  Puts a game-specific IsThereAnyDeal link to the game pages on Epic Games Store
// @author       1N07
// @license      unlicense
// @icon         https://epicgames.com/favicon.ico
// @compatible   firefox Tested on Firefox v122.0 and Tampermonkey 5.0.1
// @compatible   firefox Likely to work on other userscript managers, but not tested
// @compatible   chrome Latest version untested, but likely works with at least Tampermonkey
// @compatible   opera Latest version untested, but likely works with at least Tampermonkey
// @compatible   edge Latest version untested, but likely works with at least Tampermonkey
// @compatible   safari Latest version untested, but likely works with at least Tampermonkey
// @match        https://store.epicgames.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      google.com
// @noframes
// ==/UserScript==

(() => {
	let OpenSearchResultsInsteadHandle;
	let OpenSearchResultsInstead = GM_getValue("OpenSearchResultsInstead", false);
	SetOpenSearchResultsInsteadHandle();

	addGlobalStyle("html.ITADLoading * { cursor: progress; }");
	let lastUrl = null;
	setInterval(() => {
		if (window.location.href !== lastUrl) OnUrlChange();
	}, 200);

	let windowLoaded = false;
	window.onload = () => {
		windowLoaded = true;
	};

	function OnUrlChange() {
		lastUrl = window.location.href;

		//Epic Game Store Page
		if (
			window.location.href.match(
				/https:\/\/store\.epicgames\.com\/.+?\/(p|b)\/.+/g,
			)
		) {
			let place;
			let insertInterval = setInterval(() => {
				place = document.getElementsByClassName("css-bco1gb")[0];
				if (place) {
					clearInterval(insertInterval);
					addGlobalStyle(`
						#ITADButt:hover, #ITADButt:focus, #ITADButt:active
						{
							filter: brightness(125%);
						}
					`);
					InsertAndMakeSureButtonStays();
				}
			}, 200);
		}
	}

	function InsertAndMakeSureButtonStays() {
		let ButtonStayInterval = setInterval(() => {
			if (!document.getElementById("ITADButt")) {
				const place = document.getElementsByClassName("css-bco1gb")[0];
				if (place) {
					const newElem = CreateHTMLFrag(
						`<div><button id="ITADButt" class="eds_14hl3lj9 eds_14hl3ljb eds_14hl3ljh eds_1ypbntdc eds_14hl3lja eds_14hl3lj2" style="background-color: #3090ce; color: black;"><span class="css-hahhpe-PurchaseCTA__ctaText">IsThereAnyDeal</span></button></div>`,
					);
					place.insertBefore(newElem, place.firstChild);
					document.getElementById("ITADButt").onclick = GoToITAD;
				}
			}

			if (windowLoaded) clearInterval(ButtonStayInterval);
		}, 200);
	}

	function GoToITAD() {
		let name = null; //Disabled this method for now, it doesn't seem that great afterall...   document.getElementById("page-meta-keywords").getAttribute("content"); //this seems to be a fairly reliable way to get the title of the game without any affixes or what have you, like editions etc.
		if (name === null || name.length === 0)
			name = document.querySelector("h1.eds_1ypbntd0").textContent;
		if (name === null || name.length === 0)
			alert("ITAD on EG: Could not find game title");

		let link = `https://isthereanydeal.com/search/?q=${encodeURIComponent(name)}`;

		if (OpenSearchResultsInstead) window.open(link, "_blank");
		else {
			document.documentElement.classList.add("ITADLoading");
			const termsToHelpGetRightPage =
				'+info+-"Price+History"+-"Region+Comparison"';
			const getUrl = `https://www.google.com/search?btnI=I&q=site:https://isthereanydeal.com/game/+${encodeURIComponent(name)}${termsToHelpGetRightPage}`;
			GM_xmlhttpRequest({
				method: "GET",
				url: getUrl,
				headers: {
					referer: "https://www.google.com/",
				},
				onload: (response) => {
					console.log(JSON.stringify(response));
					console.log(response.finalUrl);
					link = response.finalUrl.split("google.com/url?q=")[1];
					if (link) window.open(link, "_blank");
					else alert("Could not find game page");

					document.documentElement.classList.remove("ITADLoading");
				},
				onerror: () => {
					alert("GM_xmlhttpRequest error");
					document.documentElement.classList.remove("ITADLoading");
				},
				onabort: () => {
					alert("GM_xmlhttpRequest aborted");
					document.documentElement.classList.remove("ITADLoading");
				},
				ontimeout: () => {
					alert("GM_xmlhttpRequest timeout");
					document.documentElement.classList.remove("ITADLoading");
				},
			});
		}
	}

	function GetLinkToGamePage(ITADPage, searchTerm) {
		const reDirLinks = ITADPage.querySelectorAll(".card__title");
		if (reDirLinks !== null && reDirLinks.length > 0) {
			const searchTermRE = new RegExp(searchTerm, "g");
			let leastExtraEl = null;
			let leastExtraNum = 99999;
			for (let i = 0; i < reDirLinks.length; i++) {
				const thisLen = reDirLinks[i].textContent.replace(
					searchTermRE,
					"",
				).length;
				if (thisLen < leastExtraNum) {
					leastExtraEl = reDirLinks[i];
					leastExtraNum = thisLen;
				}
			}
			if (leastExtraEl !== null) {
				//try {leastExtraEl.parentNode.parentNode.parentNode.parentNode.style.border = "5px dotted greenyellow";} catch(err){}
				return `https://isthereanydeal.com${leastExtraEl.href}`.replace(
					"https://store.epicgames.com",
					"",
				); //.href apparently REALLY wants to put the Epic domain in there for some reason, so removing that...
			}
			return null;
		}
		return null;
	}

	function CreateHTMLFrag(htmlStr) {
		const el = document.createElement("div");
		el.innerHTML = htmlStr;
		return el;
	}
	function addGlobalStyle(css) {
		const head = document.getElementsByTagName("head")[0];
		if (!head) {
			return;
		}
		const style = document.createElement("style");
		style.type = "text/css";
		style.innerHTML = css;
		head.appendChild(style);
	}
	function SetOpenSearchResultsInsteadHandle() {
		GM_unregisterMenuCommand(OpenSearchResultsInsteadHandle);

		OpenSearchResultsInsteadHandle = GM_registerMenuCommand(
			`Open search results instead (${OpenSearchResultsInstead ? "On" : "Off"}) -click to change-`,
			() => {
				OpenSearchResultsInstead = !OpenSearchResultsInstead;
				GM_setValue("OpenSearchResultsInstead", OpenSearchResultsInstead);
				SetOpenSearchResultsInsteadHandle();

				if (confirm('Press "OK" to refresh the page to apply new settings'))
					location.reload();
			},
		);
	}
})();
