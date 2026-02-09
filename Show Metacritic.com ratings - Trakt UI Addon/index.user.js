// ==UserScript==
// @name        Show Metacritic.com ratings - Trakt UI Addon
// @description This is an addon script for "Show Metacritic.com ratings" by cuzi, that displays the Metacritic info cleanly on the trakt.tv infobar
// @namespace   1N07
// @author      1N07
// @license     Unlicense
// @icon        https://raw.githubusercontent.com/OneNot/Userscripts/main/Show%20Metacritic.com%20ratings%20-%20Trakt%20UI%20Addon/logo.png
// @version     110.1.1
// @match       https://trakt.tv/movies/*
// @match       https://trakt.tv/shows/*
// @require     https://update.greasyfork.org/scripts/511024/1457631/Simple%20WaitForKeyElement.js
// @grant       GM_registerMenuCommand
// @grant       GM_unregisterMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

//TODO: Handle which comes first if both this and the other Trakt UI Addon are in use at the same time
//note: insertBEfore didn't insert before for whatever reason (even though I checked that the target was in the DOM), so might want to try somethign else...
//...or do it again and hope I just messed somethign up last time.

let HideMetacriticPanelOption;
let HideMetacriticPanel;

function ApplyHideMetacriticPanelCSS() {
    const style = document.createElement("style");
    style.innerHTML = `
    #mcdiv123 {
      display: none;
    }
  `;
    document.head.appendChild(style);
}

function WidenInfobar() {
    const style = document.createElement("style");
    style.innerHTML = `
    #summary-ratings-wrapper > .container .ul-wrapper {
        width: 100%;
        margin-left: calc(((100% - 1160px) / 2) + 193px);
    }
    #summary-ratings-wrapper > .container {
        width: 100%
    }
  `;
    document.head.appendChild(style);
}

function ApplyMetacriticTraktDisplayCSS() {
    const style = document.createElement("style");
    style.innerHTML = `
        #summary-ratings-wrapper ul li .icon.mcr-uia-icon {
            width: 30px;
            height: 30px;
            font-size: 14px;
            padding: 0;
            text-align: center;
            color: white;
            line-height: 30px;
            font-weight: bolder;
        }
        #summary-ratings-wrapper ul li .mcr-number {
            max-height: 30px;
        }
        #summary-ratings-wrapper ul li .number > .mcr-score-text {
            white-space: normal;
            word-wrap: normal;
            max-width: 120px;
            width: min-content;
            font-size: 15px;
            line-height: 0.9;
        }
        #summary-ratings-wrapper ul li .number > .mcr-voters-text {
            max-width: 120px;
            width: min-content;
            font-size: 12px;
            color: #aaa;
        }

        .c-siteReviewScore_green {
            background: #00ce7a;
        }
        .c-siteReviewScore_yellow {
            background: #ffbd3f;
        }
        .c-siteReviewScore_red {
            background: #ff6874;
        }
        .c-siteReviewScore_grey {
            background: #404040;
        }
        .c-siteReviewScore_tbd {
            background: #404040;
            border-width: 0.125rem;
            border-style: solid;
        }
    `;
    document.head.appendChild(style);
}

const MakeMetacriticScoreElement = (data, placeholder = false) => {
    const li = document.createElement("li");
    li.className = `mcr-uia-${data.type} ${placeholder ? "mcr-uia-placeholder" : ""}`;
    li.innerHTML = `
    <a href="${data.link}" title="${data.title}">
        <div class="icon mcr-uia-icon c-siteReviewScore_${data.scoreColor}" style="${data.type == "Audience" ? "border-radius: 50%;" : "border-radius: 5px;"}">${data.score}</div>
        <div class="number mcr-number">
            <div class="rating mcr-score-text">${data.scoreText}</div>
            <div class="voters mcr-voters-text"><span>${data.type == "Audience" ? "User Score" : "Metascore"}</span></div>
        </div>
    </a>
  `;
    return li;
};

const SetRealData = (from) => {
    const placeholders = document.getElementsByClassName("mcr-uia-placeholder");
    while (placeholders.length > 0) placeholders[0].remove();

    const realDataSectionParents = from?.querySelectorAll(".c-reviewsOverview_overviewDetails");
    const realDataCriticsParent = realDataSectionParents?.[0];
    const realDataUsersParent = realDataSectionParents?.[1];

    const criticsLink = realDataCriticsParent?.getElementsByTagName("a")?.[0]?.getAttribute("href");
    const usersLink = realDataUsersParent?.getElementsByTagName("a")?.[0]?.getAttribute("href");

    const criticsScoreElem = realDataCriticsParent?.getElementsByClassName("c-siteReviewScore")?.[0];
    const criticsScore = criticsScoreElem?.innerText?.trim();
    const criticsScoreColor = criticsScoreElem != null ? ([...(criticsScoreElem.classList)].find(cls => cls.startsWith("c-siteReviewScore_"))?.split("c-siteReviewScore_")?.[1] ?? "tbd") : "tbd";

    const usersScoreElem = realDataUsersParent?.getElementsByClassName("c-siteReviewScore")?.[0];
    const usersScore = usersScoreElem?.innerText?.trim();
    const usersScoreColor = usersScoreElem != null ? ([...(usersScoreElem.classList)].find(cls => cls.startsWith("c-siteReviewScore_"))?.split("c-siteReviewScore_")?.[1] ?? "tbd") : "tbd";

    const criticsSentiment = realDataCriticsParent?.getElementsByClassName("c-ScoreCard_scoreSentiment")?.[0]?.innerText?.trim();
    const usersSentiment = realDataUsersParent?.getElementsByClassName("c-ScoreCard_scoreSentiment")?.[0]?.innerText?.trim();

    const criticsVotes = realDataCriticsParent?.querySelector(".c-ScoreCard_reviewsTotal span")?.innerText?.match(/[\d,]+/)[0];
    const usersVotes = realDataUsersParent?.querySelector(".c-ScoreCard_reviewsTotal span")?.innerText?.match(/[\d,]+/)[0];


    return {
        audience: {
            type: "Audience",
            score: usersScore ?? "N/A",
            scoreText: usersSentiment ?? "N/A",
            scoreColor: usersScoreColor,
            title: `User Score: ${usersScore ?? "N/A"}\n${usersSentiment ?? "N/A"}\nBased on ${usersVotes ?? "N/A"} User Ratings`,
            link: usersLink ?? "#",
        },
        critics: {
            type: "Critics",
            score: criticsScore ?? "N/A",
            scoreText: criticsSentiment ?? "N/A",
            scoreColor: criticsScoreColor,
            title: `Metascore: ${criticsScore ?? "N/A"}\n${criticsSentiment ?? "N/A"}\nBased on ${criticsVotes ?? "N/A"} Critic Reviews`,
            link: criticsLink ?? "#",
        },
    };
};

const SetPlaceholderData = () => {
    return {
        audience: {
            type: "Users",
            score: "-",
            scoreText: "Loading...",
            scoreColor: "tbd",
            title: "Loading...",
            link: "#",
        },
        critics: {
            type: "Critics",
            score: "-",
            scoreText: "Loading...",
            scoreColor: "tbd",
            title: "Loading...",
            link: "#",
        },
    };
};

const SetHideMetacriticPanelOption = () => {
    GM_unregisterMenuCommand(HideMetacriticPanelOption);
    HideMetacriticPanelOption = GM_registerMenuCommand(
        `Hide Metacritic panel (${HideMetacriticPanel ? "yes" : "no"}) -click to change-`,
        () => {
            HideMetacriticPanel = !HideMetacriticPanel;
            GM_setValue("HideMetacriticPanel", HideMetacriticPanel);
            SetHideMetacriticPanelOption();
            if (confirm("Reload page to apply changes?")) {
                location.reload();
            }
        },
    );
};


async function WaitForIFrameContent(iframeSelector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        let observer = null;

        const timeoutId = setTimeout(() => {
            if (observer) {
                observer.disconnect();
            }
            reject(new Error(`Timeout waiting for iframe content: ${iframeSelector}`));
        }, timeout);

        WaitForKeyElement(iframeSelector, timeout).then((iframe) => {
            // Function to parse the data URL
            const tryParseContent = () => {
                if (!iframe.src || !iframe.src.startsWith('data:text/html')) {
                    return null;
                }

                try {
                    const dataUrl = iframe.src;
                    const html = decodeURIComponent(dataUrl.replace('data:text/html,', ''));
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    return doc;
                } catch (e) {
                    console.error("Error parsing iframe content:", e);
                    return null;
                }
            };

            // Try immediately
            const doc = tryParseContent();
            if (doc) {
                clearTimeout(timeoutId);
                resolve(doc);
                return;
            }

            // Watch for src attribute changes
            observer = new MutationObserver(() => {
                const doc = tryParseContent();
                if (doc) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    resolve(doc);
                }
            });

            observer.observe(iframe, {
                attributes: true,
                attributeFilter: ['src']
            });
        }).catch((err) => {
            clearTimeout(timeoutId);
            if (observer) {
                observer.disconnect();
            }
            reject(err);
        });
    });
}

(() => {
    HideMetacriticPanel = GM_getValue("HideMetacriticPanel", true);
    SetHideMetacriticPanelOption();

    WidenInfobar();

    if (HideMetacriticPanel) {
        ApplyHideMetacriticPanelCSS();
    }

    ApplyMetacriticTraktDisplayCSS();

    WaitForKeyElement(`
      .shows.show #summary-ratings-wrapper .ratings,
      .movies.show #summary-ratings-wrapper .ratings
    `, 20000).then((insertLocation) => {
        const placeHolderData = SetPlaceholderData();
        insertLocation.appendChild(
            MakeMetacriticScoreElement(placeHolderData.critics, true),
        );
        insertLocation.appendChild(
            MakeMetacriticScoreElement(placeHolderData.audience, true),
        );
        WaitForIFrameContent("#mciframe123", 20000).then((iDoc) => {
            const element = iDoc.querySelector(".hover_content");
            const data = SetRealData(element);
            insertLocation.appendChild(MakeMetacriticScoreElement(data.critics));
            insertLocation.appendChild(MakeMetacriticScoreElement(data.audience));
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log("Error getting insert position");
    });
})();
