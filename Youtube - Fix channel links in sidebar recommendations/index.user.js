// ==UserScript==
// @name         Youtube - Fix channel links in sidebar recommendations
// @namespace    1N07
// @version      2.0.0-beta.1
// @description  Fixes the channel links for the "Up next" and recommended videos below it on youtube.
// @author       1N07
// @license      Unlicense
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @match        https://www.youtube.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @noframe
// ==/UserScript==


/* TODO:
Looks like the related videos data is fetched dynamically (See network tab: "next?prettyPrint=false")...
    Should try to capture those and build a Map(videoId, channelUrl) from them.
    Unsure if the initial page load gets it from a fetch too.
        If it does, good. I can just use the one method of building the Map.
        If not, I already have the method to get that from ytInitialData.

Should stop setting the hrefs on hover and just set it when adding the link.
    The reason I did it on hover before is because the operation to get it from ytInitialData seemed a little much to run for every single video...
    Now, should set it from the Map instead, which should be light work.
    Of course, populating the map is still a big operation, but that only runs the once every time we intercept the fetch. 
    Should still put in fallbacks:
        on hover check if it has the href and if not, try to set it from the Map...
            ...because Map population could lag behind the videos getting added.
        on click check if it has the href and if not, alert error

Should also stop running HandleAllUnhandledVideos on interval after HandleAllUnhandledVideos finds no unhandled videos...
    ...then, whenever a new Map population is detected, start the interval again
*/


(function () {
    'use strict';

    RegisterGMMenuVideoOption();

    GM_addStyle(`
        .ytcl-handled { position: relative; display: inline-block; }
        .ytcl-channel-link { 
            position: absolute;
            inset: 0;
            display: block;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.333);
            z-index: 10;
            text-decoration: none;
            pointer-events: auto;
        }
        .ytcl-handled:has(.ytcl-channel-link:hover) {
            text-decoration: underline;
        }
    `);

    setInterval(HandleAllUnhandledVideos, 250);




    function RegisterGMMenuVideoOption() {
        console.log("RegisterGMMenuVideoOption");
        GM_registerMenuCommand(`TEMP`, () => {
            HandleAllUnhandledVideos();
        }, { id: "temp" });
    }

    function HandleAllUnhandledVideos() {
        //console.log('HandleAllUnhandledVideos');
        document.querySelectorAll('#items.ytd-watch-next-secondary-results-renderer #contents > yt-lockup-view-model.ytd-item-section-renderer .ytContentMetadataViewModelHost > .ytContentMetadataViewModelMetadataRow > span:only-of-type:not(.ytcl-handled)')
            .forEach(videoChannelSpan => {
                const a = document.createElement('a');
                a.className = 'ytcl-channel-link';
                a.href = '#';

                const onMouseEnter = () => {
                    console.log("MouseEnter: Resolving channelUrl...");
                    const videoId = Array.from(videoChannelSpan?.closest(".ytLockupViewModelHost")?.classList ?? [])
                        .find(c => c.startsWith('content-id-'))?.split('content-id-')?.[1]?.trim();
                    console.log("videoId: " + videoId);
                    const channelUrl = GetChannelUrlFromVideoId(videoId);
                    if (channelUrl) {
                        a.href = channelUrl;
                        a.removeEventListener('mouseenter', onMouseEnter); // remove handler once resolved
                    }
                };

                a.addEventListener('mouseenter', onMouseEnter);

                a.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isDefault = !a.href || a.getAttribute('href').endsWith("#");
                    if (isDefault) {
                        e.preventDefault();
                        alert('Error: failed to get channel url');
                        return 0;
                    }
                });

                videoChannelSpan.appendChild(a);
                videoChannelSpan.classList.add('ytcl-handled');
            });
    }


    /**
     * This appears to only work (as the name ytInitialData implies I suppose) if the page on which this is done was the initially loaded page.
     * Though it does work for all dynamically loaded related videos too (infinite scroll), but not if any soft navigation between pages happens...
     */
    function GetChannelUrlFromVideoId(videoId) {
        const relatedVideosData = unsafeWindow
            ?.ytInitialData
            ?.contents
            ?.twoColumnWatchNextResults
            ?.secondaryResults
            ?.secondaryResults
            ?.results
            ?.[0]
            ?.itemSectionRenderer
            ?.contents;
        if (relatedVideosData)
            console.log("got relatedVideosData");
        const videoMetadata = relatedVideosData?.find(o => o?.lockupViewModel?.contentId === videoId);
        if (videoMetadata)
            console.log("got videoMetadata");
        return videoMetadata
            ?.lockupViewModel
            ?.metadata
            ?.lockupMetadataViewModel
            ?.image
            ?.decoratedAvatarViewModel
            ?.rendererContext
            ?.commandContext
            ?.onTap
            ?.innertubeCommand
            ?.commandMetadata
            ?.webCommandMetadata
            ?.url;
    }
})();
