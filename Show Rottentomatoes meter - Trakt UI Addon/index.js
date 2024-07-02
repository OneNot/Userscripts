// ==UserScript==
// @name        Show Rottentomatoes meter - Trakt UI Addon
// @description This is an addon script for "Show Rottentomatoes meter" by cuzi, that displays the Rottentomatoes info cleanly on the trakt.tv infobar
// @namespace   1N07
// @author      1N07
// @license     MIT
// @icon        https://cdn.jsdelivr.net/gh/OneNot/Userscripts@5461d4fda44160715de147a70e2adc9b37c0dd50/Show%20Rottentomatoes%20meter%20-%20Trakt%20UI%20Addon/logo.png
// @version     48.1.3
// @match       https://trakt.tv/movies/*
// @match       https://trakt.tv/shows/*
// @require     https://cdn.jsdelivr.net/gh/OneNot/Userscripts@5461d4fda44160715de147a70e2adc9b37c0dd50/Libraries/WaitForKeyElement/index.min.js
// ==/UserScript==

const HideRottenTomatoesMeterPanel = true;

function ApplyHideRottenTomatoesMeterPanelCSS() {
	const style = document.createElement("style");
	style.innerHTML = `
    #mcdiv321rotten {
      display: none;
    }
  `;
	document.head.appendChild(style);
}

const RottentomatoesIcons = {
	empty_tomato: `<svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(1.33 16.27)">
      <mask id="a" fill="#fff">
        <path d="M0 .247h77.083v63.468H0z"/>
      </mask>
      <path d="M77.014 27.043C76.242 14.674 69.952 5.42 60.488.247c.053.301-.215.678-.52.545-6.19-2.708-16.693 6.056-24.031 1.466.055 1.647-.267 9.682-11.585 10.148-.268.011-.415-.262-.246-.455 1.514-1.726 3.042-6.097.845-8.428-4.706 4.217-7.44 5.804-16.463 3.71C2.711 13.274-.562 21.542.08 31.841c1.311 21.025 21.005 33.044 40.837 31.806 19.83-1.236 37.408-15.58 36.097-36.604" fill="#DEDEDF" mask="url(#a)"/>
    </g>
    <path d="M42.202 11.465c4.075-.971 15.796-.095 19.551 4.887.226.299-.092.864-.455.705-6.19-2.708-16.693 6.056-24.031 1.467.055 1.647-.267 9.682-11.585 10.148-.268.01-.415-.262-.246-.455 1.514-1.727 3.042-6.098.845-8.428-5.127 4.594-7.906 6.07-19.032 3.062-.364-.098-.24-.683.147-.83 2.103-.804 6.867-4.324 11.375-5.876a15.308 15.308 0 0 1 2.548-.657c-4.963-.444-7.2-1.134-10.356-.658a.392.392 0 0 1-.367-.627c4.253-5.478 12.088-7.132 16.922-4.222-2.98-3.692-5.314-6.636-5.314-6.636l5.53-3.142 3.948 8.82c4.114-6.078 11.768-6.639 15.002-2.326.192.256-.009.62-.33.613-2.631-.064-4.08 2.33-4.19 4.15l.038.005" fill="#BCBDBE"/>
  </svg>`,
	empty_popcorn: `<svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.631 19.099c.23 4.896 12.358 8.777 27.27 8.692 13.023-.074 23.886-3.15 26.548-7.19a3.902 3.902 0 0 0-2.388-1.262 3.903 3.903 0 0 0-3.266-4.189 3.905 3.905 0 0 0-3.854-4.657c-.048.001-.096.007-.144.009.137-.403.215-.834.212-1.284a3.905 3.905 0 0 0-3.926-3.882 3.89 3.89 0 0 0-1.4.271A3.901 3.901 0 0 0 48.5 3.544a3.903 3.903 0 0 0-3.894-3.42 3.895 3.895 0 0 0-3.08 1.54A3.89 3.89 0 0 0 38.631.399a3.905 3.905 0 0 0-3.692 5.107c-.88.163-1.654.62-2.22 1.266a3.904 3.904 0 0 0-3.79-2.891 3.902 3.902 0 0 0-3.657 2.61 3.903 3.903 0 0 0-2.442 3.64c.002.366.058.718.154 1.054a3.884 3.884 0 0 0-1.584-.328 3.903 3.903 0 0 0-3.664 2.626 3.876 3.876 0 0 0-1.662-.365 3.904 3.904 0 0 0-3.882 3.927 3.88 3.88 0 0 0 .536 1.947c-.034.034-.064.072-.097.108" fill="#DEDEDF"/>
    <path d="M61.074 68.158c-1.146 1.74-3.374 3.543-5.705 4.745l3.985-40.418c2.535-.814 5.01-1.893 6.832-3.441l-5.112 39.114Zm-9.67 6.43c-3.859 1.278-6.103 1.673-9.314 1.989l.5-41.534c3.548-.101 8.14-.582 12.053-1.417l-3.24 40.963Zm-23.006 0L25.16 33.627c3.912.835 8.504 1.316 12.052 1.417l.5 41.534c-3.211-.316-5.455-.711-9.314-1.988Zm-9.67-6.43-5.112-39.114c1.823 1.548 4.297 2.627 6.832 3.441l3.985 40.418c-2.331-1.202-4.558-3.005-5.704-4.745Zm42.06-54.547a3.913 3.913 0 0 1 .007 1.538 3.902 3.902 0 0 1 3.266 4.189c.944.125 1.781.587 2.388 1.261-2.661 4.041-13.525 7.117-26.548 7.192-14.911.085-27.04-3.796-27.27-8.692.033-.036.063-.074.097-.108a3.894 3.894 0 0 1-.471-1.294c-1.428 1.355-2.292 2.448-2.14 4.039.015.212 6.317 45.335 6.317 45.335.727 7.146 11.105 12.858 23.467 12.929 12.362-.07 22.74-5.783 23.467-12.93 0 0 6.302-45.122 6.317-45.334.302-3.183-3.422-6.072-8.897-8.125Z" fill="#BCBDBE"/>
  </svg>`,
	red_popcorn: `<svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(10.1)">
      <mask id="a" fill="#fff">
        <path d="M.018.125h59.584v79.857H.018z"/>
      </mask>
      <path d="M2.531 19.099c.23 4.896 12.358 8.777 27.27 8.692 13.023-.074 23.886-3.15 26.548-7.19a3.902 3.902 0 0 0-2.388-1.262 3.903 3.903 0 0 0-3.266-4.189 3.905 3.905 0 0 0-3.854-4.657c-.048.001-.096.007-.144.009.137-.403.215-.834.212-1.284a3.905 3.905 0 0 0-3.926-3.882 3.89 3.89 0 0 0-1.4.271A3.901 3.901 0 0 0 38.4 3.544a3.903 3.903 0 0 0-3.894-3.42 3.895 3.895 0 0 0-3.08 1.54A3.89 3.89 0 0 0 28.531.399a3.905 3.905 0 0 0-3.692 5.107c-.88.163-1.654.62-2.22 1.266a3.904 3.904 0 0 0-3.79-2.891 3.902 3.902 0 0 0-3.657 2.61 3.903 3.903 0 0 0-2.442 3.64c.002.366.058.718.154 1.054a3.884 3.884 0 0 0-1.584-.328 3.903 3.903 0 0 0-3.664 2.626 3.876 3.876 0 0 0-1.662-.365 3.904 3.904 0 0 0-3.882 3.927 3.88 3.88 0 0 0 .536 1.947c-.034.034-.064.072-.097.108" fill="#F9D320" mask="url(#a)"/>
      <path d="M50.974 68.158c-1.146 1.74-3.374 3.543-5.705 4.745l3.985-40.418c2.535-.814 5.01-1.893 6.832-3.441l-5.112 39.114Zm-9.67 6.43c-3.859 1.278-6.103 1.673-9.314 1.989l.5-41.534c3.548-.101 8.14-.582 12.053-1.417l-3.24 40.963Zm-23.006 0L15.06 33.627c3.912.835 8.504 1.316 12.052 1.417l.5 41.534c-3.211-.316-5.455-.711-9.314-1.988Zm-9.67-6.43L3.517 29.044c1.823 1.548 4.297 2.627 6.832 3.441l3.985 40.418c-2.331-1.202-4.558-3.005-5.704-4.745Zm42.06-54.547a3.913 3.913 0 0 1 .007 1.538 3.902 3.902 0 0 1 3.266 4.189c.944.125 1.781.587 2.388 1.261-2.661 4.041-13.525 7.117-26.548 7.192-14.911.085-27.04-3.796-27.27-8.692.033-.036.063-.074.097-.108a3.894 3.894 0 0 1-.471-1.294C.729 19.052-.135 20.145.017 21.736c.015.212 6.317 45.335 6.317 45.335C7.061 74.217 17.439 79.929 29.801 80c12.362-.07 22.74-5.783 23.467-12.93 0 0 6.302-45.122 6.317-45.334.302-3.183-3.422-6.072-8.897-8.125Z" fill="#DB382A" mask="url(#a)"/>
    </g>
    <path d="m25.16 33.626 3.238 40.963c3.86 1.277 6.103 1.672 9.314 1.988l-.5-41.534c-3.548-.101-8.14-.582-12.052-1.417M42.09 76.577c3.211-.316 5.455-.711 9.314-1.988l3.238-40.963c-3.912.835-8.504 1.316-12.052 1.417l-.5 41.534M55.37 72.903c2.33-1.202 4.558-3.005 5.703-4.745l5.113-39.114c-1.823 1.548-4.297 2.627-6.832 3.441L55.37 72.903M13.616 29.044l5.112 39.114c1.147 1.74 3.374 3.543 5.705 4.745l-3.985-40.418c-2.535-.814-5.01-1.893-6.832-3.441" fill="#FFFFFE"/>
  </svg>`,
	green_popcorn: `<svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg">
    <path d="M45.478 52.075c.473-1.17 2.148-1.884 3.35-1.8 1.287.089 2.652 1.44 2.891 2.77.044-.048.09-.094.138-.139.413-.394.93-.656 1.496-.728a3.375 3.375 0 0 1-.048-1.215c.21-1.482 1.398-2.594 2.76-2.583.879.007 1.65.457 2.152 1.148.045-.057.094-.108.143-.16.574-2.993.938-6.373 1.021-9.961.285-12.337-2.845-22.415-6.99-22.51-4.146-.096-7.738 9.827-8.022 22.163 0 0-.22 4.5 1.109 13.015" fill="#185A30"/>
    <path d="M73.545 65.566c.245-.41.382-.9.372-1.42.08-1.683-1.076-3.21-2.683-3.04.046-.193.076-.393.088-.6.096-1.685-1.066-3.138-2.597-3.245a3.215 3.215 0 0 0-.1-.004 3.34 3.34 0 0 0 .21-1.38c-.08-1.403-1.046-2.585-2.305-2.818a2.535 2.535 0 0 0-1.299.098c-.381-.94-1.182-1.637-2.156-1.784-.077-1.525-1.18-2.78-2.598-2.88-.892-.061-1.712.349-2.26 1.035-.502-.691-1.273-1.14-2.152-1.148-1.362-.01-2.55 1.1-2.76 2.583-.06.42-.038.831.048 1.215a2.653 2.653 0 0 0-1.496.728c-.047.045-.094.09-.138.139-.239-1.33-1.604-2.68-2.89-2.77-1.203-.084-2.9.647-3.351 1.8.198 2.011 1.455 7.492 6 12.41l.041.002c.439.397 1.01.615 1.62.56.38-.033.727-.168 1.028-.377l.073.005c.4.278.88.423 1.389.378a2.09 2.09 0 0 0 .555-.13 2.506 2.506 0 0 0 2.49 1.386 2.615 2.615 0 0 0 1.972-1.192l.136.01a2.14 2.14 0 0 0 1.577.638c.496.752 1.408 1.214 2.415 1.125a2.768 2.768 0 0 0 1.048-.309c.526.648 1.39 1.033 2.338.95.937-.082 1.729-.602 2.16-1.32.423.34.953.522 1.516.471a2.172 2.172 0 0 0 1.396-.696l.06.004c.083-.12.154-.243.22-.367l.004-.008c.01-.016.02-.032.029-.05" fill="#F9D320"/>
    <path d="M42.209 21.672 6.562 25.187c1.06-2.056 2.65-4.02 4.185-5.031l34.497-4.51c-1.365 1.608-2.317 3.79-3.035 6.026Zm3.035 40.34-34.497-4.51c-1.535-1.01-3.125-2.975-4.185-5.03l35.647 3.514c.718 2.236 1.67 4.418 3.035 6.026ZM5.075 48.974C3.95 45.571 3.6 43.592 3.322 40.76l36.63.442c.09 3.13.515 7.18 1.251 10.63L5.075 48.974Zm0-20.29 36.128-2.856c-.736 3.45-1.16 7.5-1.25 10.63l-36.631.441c.278-2.833.627-4.811 1.753-8.215ZM56.72 16.309c-2.286-2.661-3.926-3.91-5.332-3.748-.262.033-39.984 5.571-39.984 5.571C5.1 18.773.063 27.926 0 38.83c.062 10.903 5.1 20.056 11.403 20.697 0 0 39.797 5.559 39.984 5.572.333-.002.66-.047.984-.13a2.206 2.206 0 0 1-.852-.481l-.04-.003c-4.546-4.917-5.803-10.398-6.001-12.409l.002-.004-.002.004c-1.329-8.515-1.11-13.015-1.11-13.015.285-12.336 3.877-22.26 8.022-22.164 4.146.096 7.276 10.174 6.991 22.51-.083 3.589-.447 6.97-1.021 9.962a2.607 2.607 0 0 1 2.117-.874c.135.01.267.032.396.062 2.517-13.775-.122-27.226-4.154-32.247Z" fill="#129B47"/>
    <path d="M41.203 25.828 5.075 28.684C3.95 32.088 3.6 34.066 3.322 36.899l36.63-.442c.09-3.129.515-7.179 1.251-10.63M45.244 15.647l-34.497 4.509c-1.535 1.01-3.125 2.975-4.185 5.03l35.647-3.514c.718-2.236 1.67-4.418 3.035-6.025M6.562 52.472c1.06 2.055 2.65 4.02 4.185 5.03l34.497 4.51c-1.365-1.608-2.317-3.79-3.035-6.026L6.562 52.472M39.955 41.135l-36.63-.441c.277 2.832.626 4.811 1.753 8.215l36.128 2.856c-.737-3.45-1.16-7.5-1.25-10.63" fill="#FFFFFE"/>
  </svg>`,
	rotten: `<svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0 1.23)">
      <mask id="a" fill="#fff">
        <path d="M0 .162h79.742v77.361H0z"/>
      </mask>
      <path d="M71.464 70.226c-15.118.793-18.207-16.506-24.138-16.382-2.528.052-4.52 2.695-3.645 5.775.481 1.693 1.815 4.175 2.656 5.716 2.966 5.437-1.418 11.59-6.549 12.11-8.526.865-12.082-4.081-11.862-9.144.247-5.684 5.066-11.492.123-13.963-5.18-2.59-9.39 7.537-14.347 9.798-4.487 2.046-10.714.46-12.928-4.522C-.781 56.113-.5 49.372 6.425 46.8c4.325-1.606 13.963 2.101 14.457-2.594.57-5.413-10.124-5.87-13.344-7.167-5.698-2.297-9.06-7.21-6.426-12.48 1.977-3.954 7.793-5.563 12.233-3.831 5.319 2.074 6.172 7.59 8.897 9.885 2.347 1.977 5.56 2.225 7.661.865 1.55-1.003 2.065-3.205 1.48-5.217-.775-2.67-2.832-4.337-4.84-5.97-3.573-2.905-8.617-5.403-5.566-13.33C23.477.462 30.813.228 30.813.228c2.915-.328 5.525.552 7.651 2.452 2.843 2.54 3.397 5.935 2.921 9.558-.434 3.306-1.605 6.202-2.215 9.477-.708 3.804 1.325 7.636 5.19 7.785 5.085.197 6.61-3.712 7.232-6.189.91-3.624 2.106-6.99 5.47-9.108 4.827-3.042 11.533-2.376 14.645 3.47 2.46 4.626 1.67 10.994-2.105 14.47-1.693 1.56-3.73 2.11-5.933 2.126-3.158.022-6.316-.055-9.248 1.423-1.996 1.006-2.866 2.645-2.866 4.842 0 2.142 1.115 3.54 2.921 4.45 3.402 1.715 7.158 2.066 10.833 2.71 5.33.933 10.015 2.81 13.024 7.756l.079.131c3.455 5.856-.159 14.287-6.948 14.644" fill="#0AC855" mask="url(#a)"/>
    </g>
  </svg>`,
	fresh: `<svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(1.33 16.27)">
      <mask id="a" fill="#fff">
        <path d="M0 .247h77.083v63.468H0z"/>
      </mask>
      <path d="M77.014 27.043C76.242 14.674 69.952 5.42 60.488.247c.053.301-.215.678-.52.545-6.19-2.708-16.693 6.056-24.031 1.466.055 1.647-.267 9.682-11.585 10.148-.268.011-.415-.262-.246-.455 1.514-1.726 3.042-6.097.845-8.428-4.706 4.217-7.44 5.804-16.463 3.71C2.711 13.274-.562 21.542.08 31.841c1.311 21.025 21.005 33.044 40.837 31.806 19.83-1.236 37.408-15.58 36.097-36.604" fill="#FA320A" mask="url(#a)"/>
    </g>
    <path d="M42.202 11.465c4.075-.971 15.796-.095 19.551 4.887.226.299-.092.864-.455.705-6.19-2.708-16.693 6.056-24.031 1.467.055 1.647-.267 9.682-11.585 10.148-.268.01-.415-.262-.246-.455 1.514-1.727 3.042-6.098.845-8.428-5.127 4.594-7.906 6.07-19.032 3.062-.364-.098-.24-.683.147-.83 2.103-.804 6.867-4.324 11.375-5.876a15.308 15.308 0 0 1 2.548-.657c-4.963-.444-7.2-1.134-10.356-.658a.392.392 0 0 1-.367-.627c4.253-5.478 12.088-7.132 16.922-4.222-2.98-3.692-5.314-6.636-5.314-6.636l5.53-3.142 3.948 8.82c4.114-6.078 11.768-6.639 15.002-2.326.192.256-.009.62-.33.613-2.631-.064-4.08 2.33-4.19 4.15l.038.005" fill="#00912D"/>
  </svg>`,
	certified_fresh: `<svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <path id="a" d="M.016.006h75.789V15.62H.016z"/>
    </defs>
    <g fill="none" fill-rule="evenodd">
      <g transform="translate(2.085 64.365)">
        <mask id="b" fill="#fff">
          <use xlink:href="#a"/>
        </mask>
        <path d="M75.706 5.352A23.948 23.948 0 0 0 67.094.006a727.378 727.378 0 0 0-3.306 9.532c-.021.061-.106.097-.195.081-.014-.002-2.688-.47-4.648-.737-.07.78-.16 1.673-.16 1.673 4.13.261 7.662 2.266 9.742 5.028.065.073.166.069.196-.009.711-2.87.907-5.931.548-9.016.002-.032.027-.056.069-.065 1.942-.61 4.09-.944 6.374-.91.124.013.12-.107-.008-.23M17.02 10.554c-4.13.261-7.662 2.266-9.742 5.028-.065.073-.166.069-.197-.009-.71-2.87-.906-5.931-.547-9.016-.003-.032-.027-.056-.07-.065a20.243 20.243 0 0 0-6.373-.91c-.124.013-.121-.107.008-.23A23.952 23.952 0 0 1 8.708.006a725.87 725.87 0 0 1 3.305 9.531c.02.061.106.097.195.081.014-.002 2.66-.466 4.652-.738l.16 1.674" fill="#3DAD55" mask="url(#b)"/>
      </g>
      <path d="M20.115 15.546c.131.79.048 1.29-.486 1.834a1.647 1.647 0 0 1-1.257.524c-.491-.008-.937-.215-1.33-.6-.386-.379-.595-.813-.614-1.304-.018-.491.135-.91.479-1.261.486-.496.888-.562 1.57-.527l-.036-1.59c-1.052-.071-1.969.286-2.732 1.065-.696.71-1.029 1.532-1.019 2.474.016.935.372 1.743 1.082 2.438.71.696 1.533 1.056 2.461 1.06.928.005 1.737-.352 2.432-1.061.858-.876 1.203-1.876 1.035-2.986l-1.585-.066M23.99 13.764l-.617-.979 2.587-1.633-.793-1.256-2.587 1.632-.551-.873 2.726-1.721-.824-1.305-4.31 2.719 3.61 5.721 4.31-2.719-.824-1.306-2.726 1.72M29.761 8.608l-.785.27-.516-1.507.785-.27c.767-.262 1.17-.156 1.346.356.178.52-.1.901-.83 1.151Zm2.498-1.702c-.488-1.425-1.743-1.872-3.414-1.3l-2.548.873 2.193 6.401 1.662-.57-.679-1.98.658-.226 1.856 1.578 1.909-.655-2.143-1.816c.648-.64.816-1.401.506-2.305ZM38.496 3.687l-5.394.65.185 1.533 1.82-.219.626 5.183 1.753-.211-.625-5.184 1.82-.219-.185-1.533M40.677 10.533l1.754.096.369-6.756-1.754-.096-.37 6.756M50.062 6.814l.362-1.501-4.635-1.12-1.59 6.577 1.709.413.585-2.421 2.71.655.35-1.445-2.711-.655.292-1.21 2.928.707M52.82 6.269l-2.71 6.199 1.61.704 2.71-6.199-1.61-.704M55.678 13.633l.652-.958 2.529 1.722.837-1.229-2.53-1.721.582-.855 2.665 1.815.869-1.277-4.213-2.868-3.807 5.593 4.212 2.868.87-1.276-2.666-1.814M63.715 18.276c-.93.842-1.868.741-2.813-.304l-.318-.35 2.726-2.469.311.344c.952 1.052.982 1.976.094 2.779Zm2.362-1.318c-.121-.867-.514-1.617-1.162-2.333l-1.639-1.81-5.015 4.54 1.638 1.81c1.224 1.353 3.099 2.143 5.002.42.909-.822 1.297-1.76 1.176-2.627Z" fill="#0A0B09"/>
      <path fill="#DB382A" d="m43.616 22.448-.365-.023"/>
      <path d="M69.48 64.535" fill="#79C08D"/>
      <path d="M65.873 73.903a775.219 775.219 0 0 1 3.306-9.532 26.97 26.97 0 0 1 1.673.668l-4.98 8.864" fill="#0EA248"/>
      <path d="m9.123 65.039.035-.015-.035.015" fill="#79C08D"/>
      <path d="m14.093 73.889-4.97-8.85.035-.015c.16-.07.854-.37 1.632-.651 1.082 3.049 2.261 6.45 3.3 9.508l.003.008" fill="#0EA248"/>
      <path d="m60.87 74.92.16-1.674c-.07.779-.16 1.668-.16 1.674m4.829-.933c-.007 0-.014-.002-.02-.003a178.57 178.57 0 0 0 .02.003" fill="#309E53"/>
      <path d="M60.87 74.92c0-.006.09-.895.16-1.674a150.914 150.914 0 0 1 4.648.738l.021.003h.005l-4.834.933" fill="#129346"/>
      <path d="M14.272 73.987" fill="#309E53"/>
      <path d="m19.105 74.92-4.838-.932a151.107 151.107 0 0 1 4.678-.742l.058.615.052.536a187.226 187.226 0 0 0 .05.523" fill="#129346"/>
      <path d="M65.402 59.05c-.369-.056-.738-.109-1.107-.162 3.549-4.203 5.77-9.477 5.945-15.547.174 6.059-1.662 11.38-4.838 15.709M14.163 59.111c-2.546-3.606-4.173-7.948-4.484-12.934a34.022 34.022 0 0 1-.059-2.943c.011.458.03.917.059 1.378.352 5.653 2.395 10.477 5.553 14.341-.356.053-.713.104-1.069.158" fill="#ADADAA"/>
      <path d="M45.317 68.437c.23.065.484.103.763.114a53.14 53.14 0 0 0-.763-.114M11.934 59.47a36.642 36.642 0 0 1-1.699-2.25c-4.213-6.062-6.44-13.184-6.44-20.595 0-9.557 3.749-18.39 10.555-24.872 6.745-6.423 15.83-9.96 25.581-9.96 9.752 0 18.837 3.537 25.581 9.96 6.806 6.482 10.555 15.315 10.555 24.872 0 7.383-2.211 14.482-6.394 20.53a36.659 36.659 0 0 1-1.73 2.298c.62.103 1.242.21 1.862.32a37.626 37.626 0 0 0 7.924-23.148C77.729 15.75 60.806.13 39.931.13 19.056.13 2.134 15.75 2.134 36.625a37.628 37.628 0 0 0 7.938 23.168c.62-.111 1.24-.219 1.862-.323M66.318 62.976h-.105v-.198h.105c.105 0 .16.032.16.095 0 .067-.055.103-.16.103" fill="#E3662A"/>
      <path d="M66.318 62.778h-.105v.198h.105c.105 0 .16-.036.16-.103 0-.063-.055-.095-.16-.095M23.357 64.542c-.551 0-1.042.422-1.042 1.004 0 .574.49.992 1.042.992.57 0 1.043-.4 1.043-.992 0-.591-.482-1.004-1.043-1.004M57.274 64.262c-.487 0-.83.303-.922.737h1.803c-.039-.421-.342-.737-.881-.737" fill="#128843"/>
      <path d="m66.475 63.39-.153-.22h-.109v.22h-.216v-.8h.36c.19 0 .34.092.34.283 0 .125-.054.211-.165.262l.188.255h-.245Zm-.157-1.033a.593.593 0 0 0-.446.192.64.64 0 0 0-.181.462c0 .181.06.334.181.458.121.125.271.185.446.185a.6.6 0 0 0 .45-.185.622.622 0 0 0 .184-.458.63.63 0 0 0-.184-.462.595.595 0 0 0-.45-.192ZM31.843 59.684c.313-.006.476.906 1.273.865.358-.02.549-.464.367-.773l-.004-.007c-.16-.26-.406-.36-.688-.409-.193-.034-.392-.052-.571-.143-.095-.048-.154-.122-.154-.235 0-.116.046-.202.151-.255.155-.078.321-.074.488-.075.116-.001.224-.03.313-.112.2-.184.24-.52.111-.764-.164-.308-.518-.343-.773-.183-.177.112-.24.29-.288.48-.033.131-.113.337-.381.327-.205-.008-.312-.21-.274-.41.032-.173.093-.326.116-.5.026-.191-.004-.37-.154-.505a.505.505 0 0 0-.403-.129s-.387.012-.52.355c-.16.418.106.55.295.703.105.087.214.174.255.315.03.106.004.223-.078.275-.111.072-.28.06-.404-.045-.144-.121-.19-.412-.47-.522-.234-.091-.54-.006-.645.202-.14.278.038.538.339.659.17.068.734.092.704.378-.026.248-.535.052-.763.137a.499.499 0 0 0-.298.676c.117.262.445.346.682.238.262-.119.484-.653.757-.517.26.13.007.437-.006.737-.012.267.175.528.625.482.271-.027.502-.352.346-.638a1.798 1.798 0 0 1-.14-.302c-.047-.162.058-.302.192-.305M39.644 64.675a.921.921 0 0 0-.712.298.975.975 0 0 0-.238.651c0 .623.478.95.95.95a.92.92 0 0 0 .712-.3.974.974 0 0 0 .238-.65c0-.623-.478-.95-.95-.95" fill="#128843"/>
      <path d="M66.937 63.632a.844.844 0 0 1-.619.255.838.838 0 0 1-.615-.255.865.865 0 0 1-.248-.621c0-.246.083-.453.248-.625a.829.829 0 0 1 .615-.258c.243 0 .45.086.619.258.168.172.255.38.255.625 0 .242-.087.449-.255.621Zm-2.228 4.458c-.467.385-1.08.58-1.821.58-.962 0-1.742-.201-2.44-.659l-.131-.093.91-1.501c1.045.67 1.584.57 1.79.554.452-.035.501-.535.127-.526-.287.006-.854.065-1.696-.327-.589-.36-.973-.78-.973-1.472 0-.598.249-1.087.739-1.455.47-.353.92-.548 1.592-.58.87-.04 1.501.15 2.283.553l.165.109-.83 1.368c-.91-.365-1.381-.464-1.711-.4-.386.073-.33.448-.046.486.285.038.74-.085 1.598.22.745.297 1.187.78 1.187 1.606 0 .623-.25 1.14-.743 1.537Zm-4.556-1.99h-3.8c.105.46.613.718 1.083.718.553 0 .96-.07 1.252-.454l1.388 1.305c-.763.812-1.717.972-2.616.972-.894 0-1.635-.27-2.223-.8-.588-.529-.882-1.258-.882-2.175 0-.906.27-1.635.823-2.2.553-.576 1.27-.858 2.14-.858.906 0 1.612.282 2.106.859.493.576.74 1.27.74 2.093l-.011.54Zm-8.618 2.409c-1.622.391-3.426-.315-3.841-2.035-.293-1.214.147-2.197.98-2.84a.958.958 0 0 1 .247-.152c-.417.036-.668.015-.923.1-.027.01-.053-.02-.039-.046.272-.515.896-.766 1.338-.596l-.536-.47.411-.341.455.672c.252-.563.876-.721 1.207-.412.02.019.008.052-.018.056-.219.033-.3.26-.282.412l.19-.024c1.552-.199 2.889.575 3.262 2.122.415 1.72-.83 3.162-2.451 3.554Zm-4.293.019-.132.005c-.232.01-.54.024-.861.024-1.522 0-2.395-.764-2.395-2.242V64.73h-.593v-1.974h.593v-1.561h2.27v1.561h.896v1.974h-.895v1.435c0 .279.119.398.397.398h.72v1.964Zm-4.417-.044h-2.199v-.643l-.142.153c-.396.423-.893.647-1.438.647-.39 0-.8-.117-1.184-.34-.856-.495-1.367-1.498-1.366-2.683 0-1.18.511-2.178 1.366-2.672.384-.221.791-.338 1.177-.338.547 0 1.047.23 1.444.663l.143.157v-.658h2.199v5.714Zm-6.711.007h-2.306V65.38c0-.489-.209-.736-.621-.736-.41 0-.493.257-.52.342-.07.254-.083.398-.083.706v2.8h-2.272V65.38c0-.489-.212-.736-.632-.736-.238 0-.394.116-.455.215a.967.967 0 0 0-.096.264c-.04.235-.04.319-.04.57v2.8H26.88v-5.735h2.186l-.001.54c.155-.317.746-.69 1.576-.69.683 0 1.227.236 1.574.68l.061.078.066-.074c.413-.468.887-.667 1.584-.667.658 0 2.188.249 2.188 2.554v3.313Zm-12.715.15c-1.666 0-3.183-1.037-3.183-3.017 0-1.577.933-2.556 2.19-2.888.697-.153 1.116-.177 1.874-.028 1.307.303 2.218 1.293 2.218 2.916 0 1.98-1.433 3.017-3.1 3.017Zm-4.379-.15h-2.213v-5.35h-1.949v-2.177h6.112v2.176h-1.95v5.351Zm51.546-8.583a169.171 169.171 0 0 0-15.37-2.079c.03.201.047.414.047.643v3.306h-2.287v-3.117c0-.48-.207-.724-.616-.724-.429 0-.694.181-.694 1.08v2.761h-2.29v-4.372l-.388-.021c.003.056.007.112.007.17l-.012.54h-3.8c.105.459.613.718 1.083.718.553 0 .96-.07 1.252-.455l1.388 1.306c-.763.812-1.717.972-2.616.972-.894 0-1.635-.27-2.223-.8-.588-.53-.882-1.258-.882-2.176 0-.166.013-.323.03-.477l-.45-.009v.849h-.894v1.433c0 .279.119.398.397.398h.719v1.962l-.132.005c-.23.01-.54.023-.86.023-1.52 0-2.392-.762-2.392-2.24v-1.581h-.593v-.869c-.146 0-.293.003-.44.005v.86h-.894v1.433c0 .279.12.397.398.397h.718v1.963l-.132.005c-.23.01-.54.023-.86.023-1.52 0-2.392-.763-2.392-2.24V58.02h-.592v-.791c-.21.006-.42.015-.629.022.266.447.419 1 .419 1.66 0 1.978-1.375 3.015-3.144 3.015-1.769 0-3.226-1.037-3.226-3.015 0-.524.104-.98.287-1.37l-.415.028a2.258 2.258 0 0 1-1.081 1.504l-.071.043 1.586 2.663h-2.567l-1.429-2.442h-.379v2.442h-2.28v-3.666a168.807 168.807 0 0 0-12.462 1.796c-.109.02-.18.091-.156.156a726.226 726.226 0 0 1 4.849 13.84c.02.06.106.095.194.08a149.36 149.36 0 0 1 51.386 0c.089.015.174-.02.195-.08a726.226 726.226 0 0 1 4.849-13.84c.024-.065-.048-.136-.156-.156ZM44.7 18.191c2.208-.197 7.034-.085 9.39 2.226.14.138.02.46-.184.404-3.45-.93-8.836 3.65-12.327.689-.097.866-.879 5.047-6.839 4.428-.14-.015-.197-.17-.093-.257.924-.788 2.057-2.96 1.085-4.347-3.034 2.013-4.602 2.1-10.196-.323-.183-.08-.074-.376.14-.424 1.163-.26 3.925-1.266 6.403-1.734.471-.089.936-.143 1.383-.15-2.563-.61-3.681-1.142-5.37-1.134a.207.207 0 0 1-.144-.356c2.644-2.543 7.436-2.672 9.744-.78l-2.068-4.32 2.514-.377s.655 2.303 1.242 4.374c2.617-2.867 6.667-2.577 8.03-.073.081.15-.052.325-.219.296-1.372-.234-2.314.908-2.51 1.853l.02.005" fill="#128843"/>
      <path d="M46.084 56.257c-.487 0-.83.302-.922.737h1.803c-.039-.421-.342-.737-.881-.737M25.838 56.771c0-.465-.41-.765-1.042-.765h-.654v1.586h.654c.662 0 1.042-.3 1.042-.82" fill="#DB382A"/>
      <path d="M13.214 33.518h9.193V36.8h-5.52v1.83H22v3.177h-5.113v4.565h-3.673V33.518Zm9.832 0h5.162c3.416 0 5.375 1.643 5.375 4.508 0 1.741-.724 3.015-2.155 3.789l2.717 4.558H29.92l-2.282-3.84h-.919v3.84h-3.673V33.518Zm11.4 0h9.795V36.8h-5.909v1.44h5.608v3.178h-5.608v1.67h5.909v3.284h-9.794V33.518Zm12.391 7.844.158.205c.896 1.167 1.972 1.734 3.288 1.734.82 0 1.33-.279 1.33-.728 0-.138 0-.554-1.05-.733l-1.912-.354c-1.084-.184-1.999-.633-2.719-1.334-.716-.735-1.076-1.633-1.076-2.675 0-1.234.5-2.247 1.485-3.01.981-.759 2.165-1.144 3.518-1.144 1.993 0 3.658.765 4.949 2.273l.131.154-2.348 2.512-.164-.198c-.825-.992-1.71-1.475-2.71-1.475-.876 0-1.189.34-1.189.658 0 .117 0 .471.909.626l1.7.301c2.753.48 4.15 1.919 4.15 4.274 0 1.225-.52 2.232-1.542 2.995-1.015.756-2.234 1.124-3.727 1.124-2.251 0-4.28-1.002-5.424-2.682l-.105-.154 2.348-2.369Zm8.903-7.844h3.672v4.635h3.546v-4.635h3.69v12.855h-3.69V41.63h-3.546v4.742H55.74V33.518ZM21.868 58.115V54.25H25c2.006 0 3.157.969 3.157 2.657 0 .234-.024.453-.068.658.138-.01.277-.018.416-.027.369-.783 1.06-1.294 1.898-1.516.698-.152 1.208-.176 1.966-.027.774.18 1.408.602 1.797 1.253l.63-.019v-1.183h.592v-1.56h2.268v1.56h.895v1.11c.146-.001.293 0 .44-.002V56.05h.592v-1.56h2.268v1.56h.895v1.124l.45.009c.08-.688.34-1.26.793-1.722.552-.576 1.27-.858 2.14-.858.905 0 1.61.282 2.105.858.46.537.703 1.177.734 1.928l.388.02v-1.352h2.267v.662c.152-.346.822-.824 1.484-.824 1.168 0 1.906.697 2.09 1.936 3.042.272 6.078.623 9.1 1.058 4.028-4.772 6.346-10.923 5.902-18.052-.696-11.147-7.192-17.857-16.563-20.815.16.124.311.255.453.395.142.138.02.459-.183.404-3.45-.93-8.836 3.65-12.327.689-.097.866-.879 5.047-6.839 4.428-.14-.015-.197-.17-.093-.257.924-.788 2.057-2.96 1.085-4.347-3.034 2.013-4.602 2.1-10.196-.323a.146.146 0 0 1-.09-.127C12.384 25.533 9.067 34.79 9.68 44.612c.352 5.653 2.395 10.477 5.553 14.341a171.27 171.27 0 0 1 6.636-.838Z" fill="#DB382A"/>
      <path d="M29.91 37.99c0-.986-.758-1.189-1.896-1.189H26.72v2.466h1.295c1.7 0 1.897-.728 1.897-1.277" fill="#DB382A"/>
      <path fill="#FAD41F" d="m29.29 56.562-.027.022.027-.022M29.042 56.778l.014-.013-.014.013M28.659 57.256l-.001.002v-.002M28.089 57.565v.001c.138-.01.277-.018.415-.027v-.001c-.138.01-.277.017-.415.027M38.55 57.157l.077-.001h-.076v.001M32.707 56.094l-.073-.026.073.026M34.165 57.248l.002.001.139-.005a25.08 25.08 0 0 0-.14.004M42.746 57.174l.093.002-.093-.002M33.418 56.449l-.023-.015.023.015M32.964 56.195l-.073-.032.073.032M30.126 56.11l-.074.028c.025-.01.049-.02.074-.028M29.846 56.225l-.062.03.062-.03M33.2 56.313l-.058-.031.058.031M48.947 57.116l-.001-.008v.008M43.46 56.221l-.025.062.026-.062M48.846 56.602l-.011-.037.01.037M48.906 56.854l-.004-.02.004.02M63.31 15.153l-2.726 2.468.318.351c.945 1.045 1.883 1.146 2.813.304.888-.803.858-1.727-.094-2.779l-.31-.344M29.245 7.102l-.785.269.516 1.507.785-.27c.73-.25 1.008-.63.83-1.151-.175-.512-.58-.618-1.346-.355"/>
      <path d="M64.9 19.585c-1.902 1.723-3.777.933-5-.42l-1.64-1.81 5.016-4.54 1.639 1.81c.648.716 1.041 1.466 1.162 2.333.12.867-.267 1.805-1.176 2.627Zm-11.639-5.73 3.808-5.593 4.213 2.868-.87 1.277-2.664-1.815-.581.855 2.529 1.72-.837 1.23-2.529-1.722-.652.958 2.665 1.814-.87 1.276-4.212-2.868Zm-3.15-1.387 2.71-6.199 1.61.704-2.711 6.199-1.61-.704Zm-.558-4.496-.349 1.445-2.711-.655-.585 2.42-1.708-.412 1.589-6.577 4.635 1.12-.363 1.5-2.927-.706-.292 1.21 2.711.655Zm-7.122 2.657-1.754-.096.369-6.756 1.754.096-.37 6.756Zm-5.57-5.19.625 5.184-1.754.21-.625-5.182-1.82.22-.185-1.534 5.394-.65.185 1.533-1.82.219Zm-4.874 6.243-1.856-1.578-.658.225.68 1.981-1.663.57-2.193-6.4 2.548-.873c1.67-.573 2.926-.126 3.414 1.299.31.904.142 1.665-.506 2.305l2.143 1.816-1.909.655Zm-8.755 4.387-3.61-5.72 4.308-2.72.824 1.305-2.726 1.72.552.874 2.587-1.632.793 1.256-2.587 1.633.618.98 2.726-1.721.824 1.306-4.31 2.72Zm-2.567 2.529c-.695.71-1.504 1.066-2.432 1.061-.928-.004-1.75-.364-2.46-1.06-.71-.695-1.067-1.503-1.083-2.438-.01-.942.323-1.764 1.019-2.474.763-.78 1.68-1.136 2.732-1.065l.037 1.59c-.683-.035-1.085.03-1.571.527-.344.352-.497.77-.479 1.261.019.49.228.925.614 1.303.393.386.839.593 1.33.601.491.009.906-.166 1.257-.524.534-.545.617-1.044.486-1.834l1.585.066c.168 1.11-.177 2.11-1.035 2.986Zm44.847-6.845c-6.744-6.423-15.83-9.96-25.58-9.96-9.752 0-18.837 3.537-25.582 9.96C7.544 18.235 3.795 27.068 3.795 36.625c0 7.411 2.227 14.533 6.44 20.596a36.796 36.796 0 0 0 1.695 2.246c1.099-.184 2.2-.352 3.302-.514-3.158-3.864-5.2-8.688-5.553-14.341-.613-9.823 2.704-19.08 15.768-23.728-.012-.116.083-.264.23-.297 1.162-.26 3.924-1.266 6.402-1.734.471-.089.936-.143 1.383-.15-2.563-.61-3.681-1.142-5.37-1.134a.207.207 0 0 1-.144-.356c2.644-2.543 7.436-2.672 9.744-.78l-2.068-4.32 2.514-.377s.655 2.303 1.242 4.374c2.617-2.867 6.667-2.577 8.03-.073.081.15-.052.325-.219.296-1.372-.234-2.314.908-2.51 1.853l.02.005c2.073-.185 6.458-.097 8.935 1.83 9.371 2.96 15.867 9.67 16.563 20.816.444 7.13-1.874 13.28-5.902 18.052l-.115-.016c1.256.18 2.51.37 3.761.579a36.698 36.698 0 0 0 1.73-2.297c4.183-6.048 6.394-13.147 6.394-20.53 0-9.557-3.749-18.39-10.555-24.872Z" fill="#F9D320"/>
      <path d="m54.775 56.693-.036-.05.036.05M54.656 56.539l-.043-.046.043.046M54.88 56.858l-.028-.048.028.048M54.49 56.372l.032.027-.032-.027M54.968 57.031l-.017-.037.017.037M48.544 55.894c-.023-.038-.048-.076-.073-.113.025.037.05.075.073.113M48.766 56.358l-.022-.056.022.056M48.666 56.122c-.013-.027-.028-.053-.042-.08.014.027.029.053.042.08M54.302 56.227c-.026-.017-.052-.036-.08-.052.028.016.054.035.08.052" fill="#FAD41F"/>
      <path d="M66.768 63.47a.6.6 0 0 1-.45.184.598.598 0 0 1-.446-.185.632.632 0 0 1-.181-.458.64.64 0 0 1 .181-.462.593.593 0 0 1 .446-.192c.179 0 .329.064.45.192a.63.63 0 0 1 .184.462c0 .181-.06.334-.184.458Zm.169-1.084a.835.835 0 0 0-.619-.258.829.829 0 0 0-.615.258.866.866 0 0 0-.248.625c0 .242.083.449.248.621.17.169.373.255.615.255.243 0 .45-.086.619-.255a.858.858 0 0 0 .255-.621.859.859 0 0 0-.255-.625Zm-.619.59h-.105v-.198h.105c.105 0 .16.032.16.095 0 .067-.055.103-.16.103Zm.38-.103c0-.19-.15-.283-.342-.283h-.36v.8h.217v-.22h.109l.153.22h.245l-.188-.255a.264.264 0 0 0 .166-.262Zm-12.712 2.082c.415 1.72-.83 3.162-2.451 3.554-1.622.391-3.426-.315-3.841-2.035-.293-1.214.147-2.197.98-2.84a.958.958 0 0 1 .247-.152c-.417.036-.668.015-.923.1-.027.01-.053-.02-.039-.046.272-.515.896-.766 1.338-.596l-.536-.47.411-.341.455.672c.252-.563.876-.721 1.207-.412.02.019.008.052-.018.056-.219.033-.3.26-.282.412l.19-.024c1.552-.199 2.889.575 3.262 2.122Zm-24.242-6.157c-.3-.121-.478-.38-.34-.659.105-.208.412-.293.646-.202.28.11.326.4.47.522.123.104.293.117.404.045.082-.052.109-.169.078-.275-.041-.14-.15-.228-.255-.315-.19-.153-.455-.285-.294-.703.132-.343.519-.355.519-.355a.505.505 0 0 1 .403.13c.15.133.18.313.154.504-.023.174-.084.327-.116.5-.038.2.07.402.274.41.268.01.348-.196.381-.326.048-.192.111-.369.288-.48.255-.161.609-.126.773.182.13.244.088.58-.11.764a.445.445 0 0 1-.314.112c-.167.001-.333-.003-.488.075-.105.053-.151.14-.151.255 0 .113.059.187.154.235.18.09.378.11.571.143.282.05.529.148.688.41l.004.006c.182.309-.009.754-.367.773-.797.041-.96-.871-1.273-.865-.134.003-.239.143-.192.305.025.09.095.22.14.302.156.286-.075.61-.346.638-.45.046-.637-.215-.625-.482.013-.3.267-.606.006-.737-.273-.136-.495.398-.757.517-.237.108-.565.024-.682-.238a.499.499 0 0 1 .298-.676c.228-.085.737.11.763-.137.03-.286-.534-.31-.704-.378Zm1.698 3.127c1.769 0 3.144-1.037 3.144-3.015 0-1.623-.91-2.613-2.217-2.915-.758-.15-1.268-.125-1.966.027-1.255.333-2.187 1.311-2.187 2.888 0 1.978 1.457 3.015 3.226 3.015Zm34.01 4.628c0 .623-.25 1.14-.743 1.537-.467.385-1.08.58-1.821.58-.962 0-1.742-.201-2.44-.659l-.131-.093.91-1.501c1.045.67 1.584.57 1.79.554.452-.035.501-.535.127-.526-.287.006-.854.065-1.696-.327-.589-.36-.973-.78-.973-1.472 0-.598.249-1.087.739-1.455.47-.353.92-.548 1.592-.58.87-.04 1.501.15 2.283.553l.165.109-.83 1.368c-.91-.365-1.381-.464-1.711-.4-.386.073-.33.448-.046.486.285.038.74-.085 1.598.22.745.297 1.187.78 1.187 1.606Zm-13.806-4.775h-2.29v-5.721h2.267v.662c.152-.346.822-.824 1.484-.824 1.357 0 2.136.94 2.136 2.577v3.306h-2.287v-3.117c0-.48-.207-.724-.616-.724-.429 0-.694.181-.694 1.08v2.761Zm-11.29 4.497a.92.92 0 0 1-.712.299c-.472 0-.95-.327-.95-.95 0-.248.085-.478.238-.651a.921.921 0 0 1 .712-.298c.472 0 .95.326.95.949a.974.974 0 0 1-.238.65Zm.27-2.847-.143-.157c-.397-.434-.897-.663-1.444-.663-.386 0-.793.117-1.177.338-.855.494-1.366 1.493-1.366 2.672 0 1.185.51 2.188 1.366 2.683.384.223.793.34 1.184.34.545 0 1.042-.224 1.438-.647l.142-.153v.643h2.199V62.77h-2.199v.658Zm-5.238-5.41h-.592v-1.972h.592v-1.56h2.268v1.56h.895v1.973h-.895v1.433c0 .279.12.397.398.397h.718v1.963l-.132.005c-.23.01-.54.023-.86.023-1.52 0-2.392-.763-2.392-2.24V58.02Zm6.86 1.836h.719v1.962l-.132.005c-.23.01-.54.023-.86.023-1.52 0-2.392-.762-2.392-2.24v-1.581h-.593V56.05h.593v-1.56h2.268v1.56h.895v1.973h-.895v1.433c0 .279.119.398.397.398ZM20.97 63.14h-1.95v5.351h-2.213v-5.35h-1.949v-2.177h6.112v2.176Zm25.552 3.424h.72v1.964l-.132.005c-.232.01-.54.024-.861.024-1.522 0-2.395-.764-2.395-2.242V64.73h-.593v-1.974h.593v-1.561h2.27v1.561h.896v1.974h-.895v1.435c0 .279.119.398.397.398Zm-10.408-1.386v3.313h-2.306V65.38c0-.489-.209-.736-.621-.736-.41 0-.493.257-.52.342-.07.254-.083.398-.083.706v2.8h-2.272V65.38c0-.489-.212-.736-.632-.736-.238 0-.394.116-.455.215a.967.967 0 0 0-.096.264c-.04.235-.04.319-.04.57v2.8H26.88v-5.735h2.186l-.001.54c.155-.317.746-.69 1.576-.69.683 0 1.227.236 1.574.68l.061.078.066-.074c.413-.468.887-.667 1.584-.667.658 0 2.188.249 2.188 2.554Zm-12.757 1.36c-.551 0-1.042-.418-1.042-.992 0-.582.49-1.004 1.042-1.004.56 0 1.043.413 1.043 1.004 0 .593-.473.992-1.043.992Zm.923-3.83c-.758-.149-1.177-.125-1.875.028-1.256.332-2.189 1.311-2.189 2.888 0 1.98 1.517 3.017 3.183 3.017s3.1-1.037 3.1-3.017c0-1.623-.912-2.613-2.219-2.916Zm-.138-6.702h.654c.633 0 1.042.3 1.042.765 0 .522-.38.82-1.042.82h-.654v-1.585Zm.005 3.33h.38l1.428 2.442h2.567l-1.586-2.663.07-.043c.764-.461 1.15-1.19 1.15-2.165 0-1.688-1.15-2.657-3.156-2.657h-3.132v7.528h2.279v-2.442Zm32.205 5.663c.093-.434.435-.737.922-.737.54 0 .842.316.881.737h-1.803Zm.967-2.391c-.87 0-1.588.282-2.14.859-.553.564-.824 1.293-.824 2.199 0 .917.294 1.646.882 2.175.588.53 1.329.8 2.223.8.899 0 1.853-.16 2.616-.972l-1.388-1.305c-.292.384-.7.454-1.252.454-.47 0-.978-.259-1.084-.717h3.8l.012-.541c0-.824-.247-1.517-.74-2.093-.494-.577-1.2-.86-2.105-.86Zm-11.235-6.351c.54 0 .842.316.881.737h-1.803c.093-.435.435-.737.922-.737Zm.186 4.379c.899 0 1.853-.16 2.616-.972l-1.388-1.306c-.292.385-.699.455-1.252.455-.47 0-.978-.259-1.084-.718h3.8l.013-.54c0-.824-.247-1.517-.741-2.094-.494-.576-1.2-.858-2.105-.858-.87 0-1.588.282-2.14.858-.553.565-.824 1.294-.824 2.2 0 .917.294 1.646.882 2.175.588.53 1.33.8 2.223.8Z" fill="#F2E93C"/>
      <path d="M50.283 43.301c-1.316 0-2.392-.567-3.288-1.734l-.158-.205-2.348 2.369.105.154c1.145 1.68 3.173 2.682 5.424 2.682 1.493 0 2.712-.368 3.727-1.124 1.023-.763 1.542-1.77 1.542-2.995 0-2.355-1.397-3.793-4.15-4.274l-1.7-.3c-.909-.156-.909-.51-.909-.627 0-.318.313-.658 1.19-.658.998 0 1.884.483 2.709 1.475l.164.198 2.348-2.512-.131-.154c-1.29-1.508-2.956-2.273-4.95-2.273-1.352 0-2.536.385-3.517 1.144-.986.763-1.485 1.776-1.485 3.01 0 1.042.36 1.94 1.076 2.675.72.701 1.635 1.15 2.72 1.334l1.912.354c1.05.179 1.05.595 1.05.733 0 .449-.51.728-1.33.728M66.649 46.373V33.518h-3.691v4.635h-3.545v-4.635H55.74v12.855h3.673v-4.742h3.545v4.742h3.69M44.24 36.801v-3.283h-9.793v12.855h9.794v-3.284h-5.91v-1.67h5.609v-3.177h-5.608v-1.441h5.909M22.407 36.801v-3.283h-9.193v12.855h3.673v-4.565H22v-3.177h-5.113v-1.83h5.52M28.014 39.267H26.72v-2.466h1.295c1.138 0 1.897.203 1.897 1.19 0 .548-.197 1.276-1.897 1.276Zm5.57-1.241c0-2.865-1.96-4.508-5.376-4.508h-5.162v12.855h3.673v-3.84h.919l2.282 3.84h4.225l-2.717-4.558c1.43-.774 2.155-2.048 2.155-3.79Z" fill="#FFFFFE"/>
    </g>
  </svg>`,
};

const MakeRottenTomatoesScoreElement = (data, placeholder = false) => {
	const li = document.createElement("li");
	li.className = `rtm-ui-${data.type} ${placeholder ? "srtm-uia-placeholder" : ""}`;
	li.innerHTML = `
    <a href="${data.link}" title="${data.title}">
      <div class="icon" style="width: 30px; height: 30px;">${data.icon}</div>
      <div class="number">
        <div class="rating">${data.score}%</div>
        <div class="votes"><span>${data.type} score</span></div>
      </div>
    </a>
  `;
	return li;
};

const SetRealData = (from) => {
	const placeholders = document.getElementsByClassName("srtm-uia-placeholder");
	while (placeholders.length > 0) placeholders[0].remove();

	const link = from?.getElementsByTagName("a")?.[0]?.getAttribute("href");
	const criticsTitle = from
		?.querySelector("[title^='Critics']")
		?.getAttribute("title");
	const audienceTitle = from
		?.querySelector("[title^='Audience']")
		?.getAttribute("title");
	const audienceIconString = audienceTitle?.split("% ")?.[1]?.split(/\s/)?.[0];
	const criticsIconString = criticsTitle?.split("% ")?.[1]?.split(/\s/)?.[0];

	return {
		audience: {
			type: "Audience",
			score: audienceTitle?.split("Audience ")?.[1]?.split("%")?.[0] ?? "N/A",
			icon: RottentomatoesIcons[
				!audienceIconString || audienceIconString === "null"
					? "empty_popcorn"
					: audienceIconString
			],
			title:
				!audienceTitle || audienceIconString === "null"
					? "No audience score available"
					: audienceTitle,
			link: link ?? "#",
		},
		critics: {
			type: "Critics",
			score: criticsTitle?.split("Critics ")?.[1]?.split("%")?.[0] ?? "N/A",
			icon: RottentomatoesIcons[
				!criticsIconString || criticsIconString === "null"
					? "empty_tomato"
					: criticsIconString
			],
			title:
				!criticsTitle || criticsIconString === "null"
					? "No critics score available"
					: criticsTitle,
			link: link ?? "#",
		},
	};
};

const SetPlaceholderData = () => {
	return {
		audience: {
			type: "Audience",
			score: "...",
			icon: RottentomatoesIcons.empty_popcorn,
			title: "Loading...",
			link: "#",
		},
		critics: {
			type: "Critics",
			score: "...",
			icon: RottentomatoesIcons.empty_tomato,
			title: "Loading...",
			link: "#",
		},
	};
};

//TODO: timeouts for WaitForElements?

//TODO: try to root out false positives
//e.g.
//John Wick 5 -> finds John Wick
//Se7en (1995) -> finds Se7en days (2010) - because it's called just Seven in Rottentomatoes
//More results... is available in some cases
//Could load in all the results found and choose the first result with the matching year. That sounds like a fairly accurate solution.

(async () => {
	if (HideRottenTomatoesMeterPanel) {
		ApplyHideRottenTomatoesMeterPanelCSS();
	}

	WaitForKeyElement(`
      .shows.show #summary-ratings-wrapper .ratings,
      .movies.show #summary-ratings-wrapper .ratings
  `).then((insertLocation) => {
		const placeHolderData = SetPlaceholderData();
		insertLocation.appendChild(
			MakeRottenTomatoesScoreElement(placeHolderData.critics, true),
		);
		insertLocation.appendChild(
			MakeRottenTomatoesScoreElement(placeHolderData.audience, true),
		);
		WaitForKeyElement("#mcdiv321rotten > .firstResult").then((rottenEl) => {
			const data = SetRealData(rottenEl);
			insertLocation.appendChild(MakeRottenTomatoesScoreElement(data.critics));
			insertLocation.appendChild(MakeRottenTomatoesScoreElement(data.audience));
		});
	});
})();
