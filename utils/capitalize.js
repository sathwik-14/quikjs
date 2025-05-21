/**
 * This is a utility for string titlecase
 * @param {any} str
 * @returns {any} str
 */
export default (str) => {
  if (typeof str !== 'string' || !str) return str;
  return str[0].toUpperCase() + str.slice(1);
};
