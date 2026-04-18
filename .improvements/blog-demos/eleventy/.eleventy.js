module.exports = function (eleventyConfig) {
  // Pretty URLs: /posts/foo.md → /posts/foo/index.html
  eleventyConfig.addFilter("readableDate", (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Collection of all blog posts, sorted newest first
  eleventyConfig.addCollection("posts", (collection) => {
    return collection
      .getFilteredByGlob("posts/*.md")
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
