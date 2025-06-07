const { getFileTree } = require("../helpers/filetreeUtils");

module.exports = async function (data) {
  return getFileTree(data);
};

module.exports.data = {
  permalink: "filetree.json",
  layout: null,
  eleventyExcludeFromCollections: true,
  outputFileExtension: "json",
};
