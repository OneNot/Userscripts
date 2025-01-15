// ==UserScript==
// @name         Export Youtube Playlist in plaintext
// @namespace    1N07
// @version      0.7.7
// @description  Shows a list of the playlist video names/channels/URLs in plaintext to be easily copied
// @author       1N07
// @license      unlicense
// @compatible   firefox Tested on Firefox v134.0.1 and Tampermonkey 5.3.3
// @compatible   firefox Likely to work on other userscript managers, but not tested
// @compatible   chrome Doesn't appear to work. Will fix.
// @compatible   opera untested, but likely works with at least Tampermonkey
// @compatible   edge untested, but likely works with at least Tampermonkey
// @compatible   safari untested, but likely works with at least Tampermonkey
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @match        https://www.youtube.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(() => {
	let getVideoTitle = GM_getValue("getVideoTitle", true);
	let getVideoChannel = GM_getValue("getVideoChannel", false);
	let getVideoURL = GM_getValue("getVideoURL", false);
	let videoListSeperator = GM_getValue("videoListSeperator", " ; ");

	let listCreationAllowed = true;
	let urlAtLastCheck = "";
	let buttonInsertInterval;

	//add some CSS
	if (true) {
		addGlobalStyle(`
			tp-yt-paper-listbox#items { overflow-x: hidden; }

			#exportPlainTextList {
				cursor: pointer;
				height: 36px;
				width: 100%;
				display: flex;
				align-items: center;
			}
			#exportPlainTextList > img {
				height: 24px; width: 24px;
				color: rgb(144, 144, 144);
				padding: 0 13px 0 16px;
				filter: contrast(0%);
			}
			#exportPlainTextList > span {
				font-family: "Roboto","Arial",sans-serif;
				color: var(--yt-spec-text-primary);
				white-space: nowrap;
				font-size: 1.4rem;
				line-height: 2rem;
				font-weight: 400;
			}

			#exportPlainTextList:hover { background-color: rgba(255,255,255,0.1); }
			ytd-menu-popup-renderer.ytd-popup-container { overflow-x: hidden !important; max-height: none !important; }

			#listDisplayContainer {
				position: fixed;
				z-index: 9999;
				margin: 0 auto;
				background-color: #464646;
				padding: 10px;
				border-radius: 5px;
				left: 0;
				right: 0;
				max-width: 100vw;
				width: 1200px;
				height: 900px;
				max-height: 90vh;
				top: 5vh;
                resize: both;
                overflow: hidden;
			}
			#listDisplayContainer > textarea {
				box-sizing: border-box;
				width: 100%;
				margin: 10px 0;
				height: calc(100% - 40px);
				background-color: #262626;
				border: none;
				color: #EEE;
				border-radius: 5px;
                resize: none;
			}
			#closeTheListThing {
				float: right;
				font-weight: bold;
				background-color: RGBA(255,255,255,0.25);
				border: none;
				font-size: 17px;
				border-radius: 10px;
				height: 25px;
				width: 25px;
				cursor: pointer;
			}

			#closeTheListThing:hover { background-color: rgba(255,255,255,0.5); }

			tp-yt-iron-dropdown.ytd-popup-container #contentWrapper > yt-sheet-view-model.ytd-popup-container {
				max-height: unset !important;
			}
		`);
	}

	setInterval(() => {
		if (urlAtLastCheck !== window.location.href) {
			urlAtLastCheck = window.location.href;
			if (urlAtLastCheck.includes("/playlist?list="))
				InsertButtonASAP();
			else
				clearInterval(buttonInsertInterval);
		}
	}, 100);


	function InsertButtonASAP() {
		buttonInsertInterval = setInterval(() => {
			//wait for possible previous buttons to stop existing (due to how youtube loads pages) and for the space for the new button to be available
			if ($("#exportPlainTextList").length === 0) {
				let place = $("tp-yt-iron-dropdown.ytd-popup-container .yt-list-view-model-wiz[role='menu']");
				if (!place || place.length === 0)
					place = $("tp-yt-iron-dropdown.ytd-popup-container tp-yt-paper-listbox.ytd-menu-popup-renderer[role='listbox']");
				if (place?.length > 0) {
					place.append(`
						<div id="exportPlainTextList">
							<img src="https://i.imgur.com/emlur3a.png">
							<span>Export Playlist</span>
						</div>
					`);
					$("#exportPlainTextList").click(ScrollUntillAllVisible);
				}
			}
		}, 100);
	}

	function ScrollUntillAllVisible() {
		if (!listCreationAllowed)
			return;

		$("ytd-browse[page-subtype='playlist']").click();

		listCreationAllowed = false;
		$("#exportPlainTextList").after(`<p id="listBuildMessage" style="color: red; font-size: 1.33em;">Getting list...<br>please click out of the popup to continue autoscrolling...</p>`);
		const scrollInterval = setInterval(() => {
			if ($("ytd-continuation-item-renderer.ytd-playlist-video-list-renderer").length)
				$(document).scrollTop($(document).height());
			else {
				$("#listBuildMessage").remove();
				DisplayListOptions();
				clearInterval(scrollInterval);
			}
		}, 100);
	}

	function DisplayListOptions() {
		$("body").append(
			`<div id="listDisplayContainer">
				<p style="text-align: center;">
					<span style="font-size: 21px; font-weight: bold; color: #d9d9d9;">Playlist in plain text</span>
					<button id="closeTheListThing">X</button>
				</p>
				<textarea style="display: none;">${list}</textarea>
                <ul id="listDisplayOptions" style="list-style: none; font-size: 12px; scale: 1.4; color: #d9d9d9; width: -moz-fit-content; width: fit-content; margin: 40px auto;">
                    <li><label><input type="checkbox" ${getVideoTitle ? "checked" : ""} id="getVideoTitleCB" name="getVideoTitleCB" value="getVideoTitle"> Get titles</label></li>
                    <li><label><input type="checkbox" ${getVideoChannel ? "checked" : ""} id="getVideoChannelCB" name="getVideoChannelCB" value="getVideoChannel"> Get channel names</label></li>
                    <li><label><input type="checkbox" ${getVideoURL ? "checked" : ""} id="getVideoURLCB" name="getVideoURLCB" value="getVideoURL"> Get URLs</label></li>
                    <li><label><input type="text" style="width: 40px; text-align: center;" id="videoListSeperatorInput" name="videoListSeperatorInput" value="${videoListSeperator}"> Name/Author/URL seperator</label></li>
                    <li><button id="listDisplayGetListButton" style="position: relative; margin: 10px 0; font-size: 13px; left: 50%; -ms-transform: translateX(-50%); transform: translateX(-50%);">Get list</button></li>
                </ul>
			</div>`
		);

		$("#getVideoTitleCB").change(function () {
			getVideoTitle = $(this).is(":checked");
			GM_setValue("getVideoTitle", getVideoTitle);
		});
		$("#getVideoChannelCB").change(function () {
			getVideoChannel = $(this).is(":checked");
			GM_setValue("getVideoChannel", getVideoChannel);
		});
		$("#getVideoURLCB").change(function () {
			getVideoURL = $(this).is(":checked");
			GM_setValue("getVideoURL", getVideoURL);
		});
		$("#videoListSeperatorInput").change(function () {
			videoListSeperator = $(this).val();
			GM_setValue("videoListSeperator", videoListSeperator);
		});
		$("#listDisplayGetListButton").click(BuildAndDisplayList);
		$("#closeTheListThing").click(() => {
			$("#listDisplayContainer").remove();
			listCreationAllowed = true;
		});
	}

	function BuildAndDisplayList() {
		$("#listDisplayOptions").hide();
		$("#listDisplayContainer > textarea").show();

		const videoTitleArr = [];
		const videoChannelArr = [];
		const videoURLArr = [];
		let videoCount = 0;

		$("ytd-playlist-video-list-renderer > #contents.ytd-playlist-video-list-renderer > ytd-playlist-video-renderer #content").each(function () {
			if (getVideoTitle)
				videoTitleArr.push($(this).find("#video-title").attr("title"));

			if (getVideoURL)
				videoURLArr.push(`https://www.youtube.com${$(this).find("#video-title").attr("href").split("&")[0]}`);

			if (getVideoChannel)
				videoChannelArr.push($(this).find("#channel-name yt-formatted-string.ytd-channel-name > a").text());

			videoCount++;
		});


		let list = "";
		for (let i = 0; i < videoCount; i++) {
			if (getVideoTitle)
				list += videoTitleArr[i];

			if (getVideoChannel)
				list += (getVideoTitle ? `${videoListSeperator}` : "") + videoChannelArr[i];

			if (getVideoURL)
				list += (getVideoTitle || getVideoChannel ? `${videoListSeperator}` : "") + videoURLArr[i];

			list += "\n";
		}

		$("#listDisplayContainer > textarea").html(list);
		$("#listBuildMessage").remove();
	}

	function addGlobalStyle(css) {
		const head = document.getElementsByTagName('head')[0];
		if (!head) { return; }
		const style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = css;
		head.appendChild(style);
	}
})();