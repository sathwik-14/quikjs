/**
 * This is a utility for string titlecase
 * @param {any} str
 * @returns {any} str
 */
export default (str) => {
  if (str) return str.charAt(0).toUpperCase() + str.slice(1);
};
