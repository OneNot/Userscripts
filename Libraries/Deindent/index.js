// ==UserScript==
// @name        Simple template literal deindent
// @license     MIT
// @namespace   1N07
// @match       *://*/*
// @version     1.0
// @author      1N07
// @description Can be used as a tag function for template literals to strip code indentation from it while preserving intended indentation, by stripping out the smallest indent every line has in common.
// ==/UserScript==

/**
 * Can be used as a tag function for template literals to strip code indentation from it while preserving intended indentation,
 * by stripping out the smallest indent every line has in common.
 * @param {String} str
 * @returns str with code indentation removed
 */
function Deindent(str) {
	const smallestIndent = Math.min(
		...str
			.split("\n")
			.filter((line) => line.trim())
			.map((line) => line.match(/^\s+/)?.[0]?.length),
	);
	return str
		.split("\n")
		.map((line) => line.slice(smallestIndent))
		.join("\n");
}
