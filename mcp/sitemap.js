// ============================================================
// MCP SITEMAP CONFIG — BLA Insurance
// วาง config นี้ใน MCP UI (ไม่ได้โหลดผ่าน <script> ในหน้าเว็บ)
// เติมค่า cookieDomain + dataset/beacon จาก Salesforce Interactions account จริง
// ============================================================
//
// วิธีใช้:
//   1. Copy โค้ดนี้ทั้งหมด
//   2. ใส่ใน Salesforce Interactions > Web > Site-Wide JavaScript
//   3. แทนที่ "bangkoklife.com" ด้วย parent domain จริง
//      (GitHub Pages ใช้ "github.io")
//   4. Save & Publish
// ============================================================

function dl() { return window.blaDataLayer || {}; }

var blaSitemap = {
  global: {
    contentZones: [
      { name: "home_hero" },
      { name: "product_reco" },
      { name: "calculator_nudge" }
    ],
    onActionEvent: function(evt) { return evt; },
    user: {
      id: function() { return window._evaUserID || getAnonId(); },
      attributes: {
        customerId: function() { return window._evaUserID || getAnonId(); }
      }
    }
  },

  pageTypes: [
    {
      name: "home",
      isMatch: function() { return dl().page && dl().page.type === "home"; },
      interaction: { name: "View Home" },
      contentZones: [{ name: "home_hero" }]
    },

    {
      name: "product-detail",
      isMatch: function() { return dl().page && dl().page.type === "product-detail"; },
      interaction: { name: "View Product Detail" },
      contentZones: [{ name: "product_reco" }],
      catalog: {
        Product: {
          isMatch: function() { return !!dl().product; },
          id:      function() { return dl().product.code; },
          attributes: {
            name:          function() { return dl().product.name; },
            category:      function() { return dl().product.category; },
            taxDeductible: function() { return dl().product.taxDeductible; },
            hasPromo:      function() { return dl().product.hasPromo; }
          }
        }
      }
    },

    {
      name: "calculator",
      isMatch: function() { return dl().page && dl().page.type === "calculator"; },
      interaction: { name: "View Calculator" },
      contentZones: [{ name: "calculator_nudge" }]
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
      }
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
      }
    }
  ]
};

function getAnonId() {
  var id = localStorage.getItem("bla_anon_id");
  if (!id) {
    id = "anon_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    localStorage.setItem("bla_anon_id", id);
  }
  return id;
}

SalesforceInteractions.init({
  cookieDomain: "github.io"   // local cross-domain test: เปลี่ยนเป็น ".local"
}).then(function() {
  SalesforceInteractions.initSitemap(blaSitemap);
});
