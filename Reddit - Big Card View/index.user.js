// ==UserScript==
// @name         Reddit - Big Card View
// @namespace    1N07
// @version      0.2
// @description  Makes the card view on Reddit bigger and improves ways content is displayed to go along with that.
// @author       1N07
// @license      MIT
// @match        https://www.reddit.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @run-at       document-body
// @grant        GM_addStyle
// @grant        GM_addElement
// ==/UserScript==

//TODO: Set up user defined values for main content view width (75%) and single post image max height (70vh)

(() => {
	GM_addStyle(`
    .subgrid-container {
      max-width: calc(100vw - 272px);
      width: calc(100vw - 272px);
    }
    .main-container {
      justify-content: center;
    }
    #main-content {
      max-width: calc(100% - 1rem - 316px);
      width: 75%;
    }
    #right-sidebar-container:has(> aside) {
      display: none;
    }
    #main-content:has(+ #right-sidebar-container > aside) {
      max-width: 100%;
    }

    /*Single image post height*/
    #main-content [slot='post-media-container'] shreddit-aspect-ratio{
      --max-height: min(100%, 70vh) !important;
    }

    #main-content [slot='post-media-container'] gallery-carousel ul > li {
      visibility: visible !important;
    }
  `);

	setInterval(() => {
		const carousels = document.querySelectorAll(
			"#main-content [slot='post-media-container'] gallery-carousel:not(.rbcv-carousel-height-set)",
		);
		for (const carousel of carousels) {
			const faceplate =
				carousel.shadowRoot?.querySelector("faceplate-carousel");
			if (faceplate) {
				faceplate.style.maxHeight = "70vh";
				faceplate.style.height = "70vh";

				carousel.classList.add("rbcv-carousel-height-set");

				const carouselImgs = carousel.querySelectorAll(
					"ul > li img:not(.rbcv-image-handled)",
				);
				for (const carouselImg of carouselImgs) {
					if (!TrySetCarouselImgWidth(carouselImg)) {
						carouselImg.onload = (e) => {
							e.target.onload = null;
							TrySetCarouselImgWidth(e.target);
						};
					}
					if (!carouselImg.src)
						carouselImg.src = carouselImg.getAttribute("data-lazy-src");
					carouselImg.classList.add("rbcv-image-handled");
				}
			}
		}
	}, 500);

	function TrySetCarouselImgWidth(img) {
		if (img?.naturalWidth > 0) {
			const naturalRatio = img.naturalWidth / img.naturalHeight;
			const calculatedWidth = img.clientHeight * naturalRatio;

			if (img.parentNode?.tagName === "LI") {
				const slot = img.parentNode.getAttribute("slot");
				const postId = img.closest("gallery-carousel").getAttribute("post-id");
				GM_addElement(img.parentNode, "style", {
					class: "carousel-image-widths",
					textContent: `gallery-carousel[post-id="${postId}"] li[slot=${slot}] { width: ${calculatedWidth}px !important; }`,
				});
			}
			return true;
		}

		return false;
	}
})();
