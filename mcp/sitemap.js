function dl() { return window.blaDataLayer || {}; }

function getAnonId() {
  var id = localStorage.getItem("bla_anon_id");
  if (!id) {
    id = "anon_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    localStorage.setItem("bla_anon_id", id);
  }
  return id;
}

var sitemapConfig = {
  pageTypeDefault: {
    name: "default",
    interaction: { name: "View Page" },
    user: { id: function() { return getAnonId(); } }
  },
  pageTypes: [
    {
      name: "home",
      isMatch: function() { return dl().page && dl().page.type === "home"; },
      interaction: { name: "View Home" },
      user: { id: function() { return getAnonId(); } }
    },
    {
      name: "product-detail",
      isMatch: function() { return dl().page && dl().page.type === "product-detail"; },
      interaction: { name: "View Product Detail" },
      user: { id: function() { return getAnonId(); } }
    },
    {
      name: "calculator",
      isMatch: function() { return dl().page && dl().page.type === "calculator"; },
      interaction: { name: "View Calculator" },
      user: { id: function() { return getAnonId(); } }
    },
    {
      name: "application",
      isMatch: function() { return dl().page && dl().page.type === "application"; },
      interaction: { name: "View Application Step" },
      user: { id: function() { return getAnonId(); } }
    },
    {
      name: "confirmation",
      isMatch: function() { return dl().page && dl().page.type === "confirmation"; },
      interaction: { name: "Purchase" },
      user: { id: function() { return getAnonId(); } }
    }
  ]
};

SalesforceInteractions.init({
  cookieDomain: "buaandkwan-ctrl.github.io",
  debug: true
}).then(function() {
  SalesforceInteractions.initSitemap(sitemapConfig);
});
