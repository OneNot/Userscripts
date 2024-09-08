// ==UserScript==
// @name         Youtube - Fix channel links in sidebar recommendations
// @namespace    1N07
// @version      0.8.1
// @description  Fixes the channel links for the "Up next" and recommended videos below it on youtube.
// @author       1N07
// @license      MIT
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @match        https://www.youtube.com/*
// @require      https://update.greasyfork.org/scripts/12036/70722/Mutation%20Summary.js
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @compatible   firefox Tested on Firefox v130.0 using Tampermonkey v5.1.1
// @compatible   chrome Tested on Chrome v128.0.6613.120 using Tampermonkey v5.2.3
// @compatible   opera Latest version of Opera untested, but likely works with at least Tampermonkey
// @compatible   edge Latest version of Edge untested, but likely works with at least Tampermonkey
// @compatible   safari Latest version of Safari untested, but likely works with at least Tampermonkey
// ==/UserScript==

(() => {
	console.log("%cSCRIPT START", "color: green;");
	let videoSectionOption;
	let videoSection = GM_getValue("videoSection", true);
	SetVidSecOption();

	GM_addStyle(`
		ytd-compact-video-renderer .channel-link-blocker:hover ~ a #text.ytd-channel-name {
			text-decoration: underline;
		}
		.channel-link-blocker-parent
		{
			position: relative;
		}
		.channel-link-blocker
		{
			display: inline-block;
			position: absolute;
			width: 100%;
			height: 25px;
			background-color: rgba(255, 25, 25, 0);
			top: 32px;
			left: 0;
			z-index: 2019;
		}
	`);

	const perVideoObservers = [];
	let perVideoObserverIndexTally = 0;

	const containerObserver = new MutationSummary({
		callback: (containerSummary) => {
			console.log(
				`%cContainer Observer triggered - Added: ${containerSummary[0].added.length}, Removed: ${containerSummary[0].removed.length}, Reparented: ${containerSummary[0].reparented.length}`,
				"color: green",
			);

			// On video added
			for (const vid of containerSummary[0].added) {
				// Add blocker element
				const blockerParent = vid.querySelector(
					".metadata.ytd-compact-video-renderer",
				);
				blockerParent.classList.add("channel-link-blocker-parent");

				const blockerElem = document.createElement("a");
				blockerElem.className = "channel-link-blocker";
				blockerElem.href = "#";
				blockerParent.prepend(blockerElem);

				const channelLink = blockerParent.querySelector(
					".channel-link-blocker",
				);

				UpdateBlockerPositioning(channelLink);
				UpdateUrl(vid, channelLink);

				// Add observer id to element so we can clean up the right observer when the element is later removed
				vid.setAttribute("data-active-observer-id", perVideoObserverIndexTally);

				// Add per-video observer for when the video href changes, so we can update the channel link accordingly. Doing this because apparently these days YT just swaps the data in the elements without swapping the elements themselves.
				// Also put the observer in an array with an access key for later access
				perVideoObservers.push({
					key: perVideoObserverIndexTally,
					observer: new MutationSummary({
						callback: (vidSummary) => {
							// console.log("%cPer Video Observer triggered: href changed", "color: green");

							UpdateBlockerPositioning(channelLink);
							UpdateUrl(vid, channelLink);
						},
						rootNode: blockerParent.querySelector("a[href^='/watch']"),
						queries: [{ attribute: "href" }],
					}),
				});
				perVideoObserverIndexTally++;
			}

			// On removed
			for (const vid of containerSummary[0].removed) {
				// Get the observer id/key we stored in the element previously
				const id = vid.dataset.activeObserverId;
				// console.log("%cAttempting to remove observer: " + id, "color: red");
				if (id !== undefined) {
					// console.log("id valid");
					// Get the observer from the observer array with the key
					const index = perVideoObservers.findIndex((o) => o.key === id);
					if (index > -1) {
						// console.log("observer found");
						// Disconnect the observer and remove it from the array
						perVideoObservers[index].observer.disconnect();
						perVideoObservers.splice(index, 1);
						// console.log("%cRemoved observer: " + id, "color: red");
					}
				}
			}

			//console.log("%cObservers alive: ", "color: yellow");
			//console.log(perVideoObservers.map(x => x.key));
		},
		queries: [
			{
				element:
					"ytd-compact-video-renderer.ytd-item-section-renderer, ytd-compact-video-renderer.ytd-watch-next-secondary-results-renderer",
			},
		],
	});

	function UpdateBlockerPositioning(blocker) {
		//blocker position adjustment
		blocker.setAttribute(
			"style",
			`top: ${blocker.parentElement.querySelector("a[href^='/watch'] > h3")?.clientHeight || 0}px;`,
		);
		//above adjustment appears to rarely and randomly fail. Attempted fix by delaying adjustment as perhaps the height hasn't been computed yet?
		setTimeout(() => {
			blocker.setAttribute(
				"style",
				`top: ${blocker.parentElement.querySelector("a[href^='/watch'] > h3")?.clientHeight || 0}px;`,
			);
		}, 1000);
	}

	function UpdateUrl(fromElem, toElem) {
		//get data source object from element. Newest source used by YT is .polymerController, but older sources that may still be in use if certain flags are in place include .inst or just the element itself
		const getVideoDataSource = (o) =>
			o ? o.polymerController || o.inst || o || 0 : o || 0;

		const channelHandle = getVideoDataSource(
			fromElem,
		)?.data?.longBylineText?.runs?.find((el) =>
			el.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl?.match(
				/^\/(@|channel)/,
			),
		)?.navigationEndpoint.browseEndpoint.canonicalBaseUrl;
		if (channelHandle?.length) {
			toElem.setAttribute(
				"href",
				channelHandle + (videoSection ? "/videos" : ""),
			);
		} else {
			console.log("Failed to get channel url");
			toElem.addEventListener("click", (e) => {
				e.preventDefault();
				e.stopPropagation();
				alert(
					"'Youtube - Fix channel links in sidebar recommendations' failed to get the channel link for this video for some reason. If this happens consistently, please report it at greasyfork.",
				);
			});
		}
	}

	function SetVidSecOption() {
		GM_unregisterMenuCommand(videoSectionOption);
		videoSectionOption = GM_registerMenuCommand(
			`Fix channel links- videos section (${videoSection ? "yes" : "no"}) -click to change-`,
			() => {
				videoSection = !videoSection;
				GM_setValue("videoSection", videoSection);
				SetVidSecOption();
			},
		);
	}
})();
