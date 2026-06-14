function dl() { return window.blaDataLayer || {}; }

function getAnonId() {
  var id = sessionStorage.getItem("bla_anon_id");
  if (!id) {
    id = "anon_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    sessionStorage.setItem("bla_anon_id", id);
  }
  return id;
}

var sitemapConfig = {
  global: {
    contentZones: [
      { name: "home_hero" },
      { name: "product_reco" },
      { name: "calculator_nudge" }
    ],
    onActionEvent: function(evt) { return evt; }
  },

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
      contentZones: [{ name: "home_hero" }],
      user: { id: function() { return getAnonId(); } }
    },
    {
      name: "product-detail",
      isMatch: function() { return dl().page && dl().page.type === "product-detail"; },
      interaction: {
        name: "View Product Detail",
        itemAction: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject,
        catalog: {
          Product: [
            {
              id: function() { return dl().product && dl().product.code; },
              attributes: {
                name:          function() { return dl().product && dl().product.name; },
                category:      function() { return dl().product && dl().product.category; },
                taxDeductible: function() { return dl().product && dl().product.taxDeductible; },
                hasPromo:      function() { return dl().product && dl().product.hasPromo; }
              }
            }
          ]
        }
      },
      contentZones: [{ name: "product_reco" }],
      user: { id: function() { return getAnonId(); } }
    },
    {
      name: "calculator",
      isMatch: function() { return dl().page && dl().page.type === "calculator"; },
      interaction: { name: "View Calculator" },
      contentZones: [{ name: "calculator_nudge" }],
      user: { id: function() { return getAnonId(); } }
    },
    {
      name: "application",
      isMatch: function() { return dl().page && dl().page.type === "application"; },
      interaction: {
        name: "View Application Step",
        attributes: {
          step:     function() { return (dl().form && dl().form.step)     || 1; },
          stepName: function() { return (dl().form && dl().form.stepName) || "personal"; }
        }
      },
      user: { id: function() { return getAnonId(); } }
    },
    {
      name: "confirmation",
      isMatch: function() { return dl().page && dl().page.type === "confirmation"; },
      interaction: {
        name: "Purchase",
        attributes: {
          orderConfirmed: function() { return (dl().order && dl().order.confirmed) || false; },
          orderValue:     function() { return (dl().order && dl().order.value)     || 0; }
        }
      },
      user: { id: function() { return getAnonId(); } }
    }
  ]
};

SalesforceInteractions.init({
  debug: true
}).then(function() {
  SalesforceInteractions.initSitemap(sitemapConfig);
});
