#!/usr/bin/env node

/**
 * This is a utility function for string titlecase
 * @param {any} str
 * @returns {any} str
 */
export default (str) => {
	if (str) return str.charAt(0).toUpperCase() + str.slice(1);
};
