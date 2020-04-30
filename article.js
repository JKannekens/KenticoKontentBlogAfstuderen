// Reload page on hash change
const renderHash = () => {
  window.history.go();
};
window.addEventListener("hashchange", renderHash, false);

// Define which article is being retrieved
const articleSlug = location.hash.slice(1);

// Create article container
const articleContainer = addToElementbyId("div", "article", app);

// Call for article info
deliveryClient
  .items()
  .type("article")
  .equalsFilter("elements.url_pattern", articleSlug)
  .queryConfig({
    urlSlugResolver: (link, context) => {
      return resolveUrl(link);
    },
    richTextResolver: (item, context) => {
      return resolveLinkedItems(item);
    },
  })
  .toPromise()
  .then((response) => {
    // Check if article found before adding
    const article =
      response.items && response.items.length ? response.items[0] : undefined;

    // 404 message if not found
    if (!article) {
      app.innerHTML = notFound;
      return;
    }

    // Create nodes
    const headerImage = createElement(
      "img",
      "article-header",
      "src",
      JSON.parse(article.teaser_image.value)[0].secure_url
    );
    const title = createElement(
      "h2",
      "article-title",
      "innerText",
      article.title.value
    );
    const body = createElement(
      "div",
      "article-description",
      "innerHTML",
      article.body_copy.resolveHtml()
    );
    if (article.form_selector.value) {
      var tmp = document.createElement("div");
      tmp.innerHTML = JSON.parse(
        article.form_selector.value
      ).publish.embed_code;
      var script = tmp.getElementsByTagName("script")[0];
      var src = script.src;
      $.getScript(src)
        .done(function (script, textStatus) {
          $("body").append(
            JSON.parse(article.form_selector.value).publish.embed_code
          );
        })
        .fail(function (jqxhr, settings, exception) {
          $("div.log").text("Triggered ajaxError handler.");
        });
    }
    articleContainer.append(headerImage, title, body);
    return;
  })
  .catch((err) => {
    reportErrors(err);
  });
