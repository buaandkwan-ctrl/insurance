// ============================================================
// MCP SITEMAP CONFIG — BLA Insurance
// วาง config นี้ใน MCP UI (ไม่ได้โหลดผ่าน <script> ในหน้าเว็บ)
// เติมค่า cookieDomain + dataset/beacon จาก Salesforce Interactions account จริง
// ============================================================
//
// วิธีใช้:
//   1. Copy โค้ดนี้ทั้งหมด
//   2. ใส่ใน Salesforce Interactions > Sitemap Editor
//   3. แทนที่ "bangkoklife.com" ด้วย parent domain จริง
//      (local test: ใช้ ".local" ถ้าตั้ง /etc/hosts ตาม README)
//   4. Save & Publish
// ============================================================

function dl() { return window.blaDataLayer || {}; }

const blaSitemap = {
  global: {
    contentZones: [
      { name: "home_hero" },
      { name: "product_reco" },
      { name: "calculator_nudge" }
    ],
    onActionEvent: (evt) => evt
  },

  pageTypes: [
    // ── หน้าหลัก (Product Listing) ────────────────────────────────────────
    {
      name: "home",
      isMatch: () => dl().page?.type === "home",
      interaction: { name: "View Home" },
      contentZones: [{ name: "home_hero" }]
    },

    // ── หน้ารายละเอียดผลิตภัณฑ์ ──────────────────────────────────────────
    {
      name: "product-detail",
      isMatch: () => dl().page?.type === "product-detail",
      interaction: { name: "View Product Detail" },
      contentZones: [{ name: "product_reco" }],
      catalog: {
        Product: {
          isMatch: () => !!dl().product,
          id:      () => dl().product.code,
          attributes: {
            name:          () => dl().product.name,
            category:      () => dl().product.category,
            taxDeductible: () => dl().product.taxDeductible,
            hasPromo:      () => dl().product.hasPromo
          }
        }
      }
    },

    // ── หน้าคำนวณเบี้ย ────────────────────────────────────────────────────
    {
      name: "calculator",
      isMatch: () => dl().page?.type === "calculator",
      interaction: { name: "View Calculator" },
      contentZones: [{ name: "calculator_nudge" }]
    },

    // ── หน้ากรอกใบสมัคร (SPA — step อัพเดตผ่าน blaTrack.formStep) ────────
    {
      name: "application",
      isMatch: () => dl().page?.type === "application",
      interaction: {
        name: "View Application Step",
        // ค่า step จะถูก override ทุกครั้งที่ blaTrack.formStep() เรียก reinit()
        attributes: {
          step:     () => dl().form?.step     || 1,
          stepName: () => dl().form?.stepName || "personal"
        }
      }
    },

    // ── หน้ายืนยันการซื้อ ────────────────────────────────────────────────
    {
      name: "confirmation",
      isMatch: () => dl().page?.type === "confirmation",
      interaction: {
        name: "Purchase",
        attributes: {
          orderConfirmed: () => dl().order?.confirmed || false,
          orderValue:     () => dl().order?.value     || 0
        }
      }
    }
  ]
};

// ── Bootstrap Salesforce Interactions ────────────────────────────────────────
SalesforceInteractions.init({
  cookieDomain: "bangkoklife.com"   // local cross-domain test: เปลี่ยนเป็น ".local"
}).then(() => {
  SalesforceInteractions.initSitemap(blaSitemap);
});
