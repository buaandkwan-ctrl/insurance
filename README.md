# BLA Mock Funnel — MCP Tracking Demo

เว็บ static จำลองโครงสร้าง funnel ของ Bangkok Life Assurance เพื่อทดสอบ **MCP (Salesforce Interactions) Sitemap + Campaign + Cross-domain Tracking** ก่อนนำไปใช้กับเว็บจริง

> ⚠️ **MOCK ONLY** — ไม่ใช่เว็บจริง ใช้สำหรับทดสอบ tracking เท่านั้น

---

## โครงสร้างหน้า (Funnel)

| # | หน้า | Path | pageType |
|---|---|---|---|
| 1 | Listing / Home | `/index.html` | `home` |
| 2 | Product Detail | `/product.html?code=smartsaving101` | `product-detail` |
| 3 | Calculator | `/calculator.html?code=smartsaving101` | `calculator` |
| 4 | Application Form (SPA 5 step) | `/smartinsure/form.html` | `application` |
| 5 | Confirmation | `/smartinsure/confirmation.html` | `confirmation` |

---

## วิธีรันแบบ Single Origin (GitHub Pages / Local demo)

```bash
# รันจาก root ของ project
python3 -m http.server 8080

# เปิดเบราว์เซอร์ที่:
# http://localhost:8080/
```

---

## วิธีรันแบบ 2 Origin (ทดสอบ Cross-domain จริง)

### 1. ตั้งค่า /etc/hosts

```bash
sudo nano /etc/hosts

# เพิ่มบรรทัดนี้:
127.0.0.1    main.local
127.0.0.1    form.local
```

### 2. รัน main site (port 8080)

```bash
# รันจาก root ของ project
python3 -m http.server 8080

# เข้าถึงได้ที่: http://main.local:8080/
```

### 3. รัน form site (port 8081)

```bash
# สร้าง folder แยก แล้วคัดลอก smartinsure/ และ assets/ เข้าไป
mkdir -p /tmp/bla-form
cp -r smartinsure/ /tmp/bla-form/
cp -r assets/ /tmp/bla-form/

# แก้ path ใน form.html และ confirmation.html ให้ชี้ไป assets/ แทน ../assets/
# (หรือ symlink)

cd /tmp/bla-form
python3 -m http.server 8081

# เข้าถึงได้ที่: http://form.local:8081/smartinsure/form.html
```

### 4. ตั้งค่า MCP cookieDomain

ใน `mcp/sitemap.js` เปลี่ยน:

```js
// Production
cookieDomain: "bangkoklife.com"

// Local 2-origin testing (ใช้ parent domain ของ main.local + form.local)
cookieDomain: "local"
// หรือถ้า hostname เป็น sub.bangkoklife.com.local ใช้:
cookieDomain: ".bangkoklife.com.local"
```

### 5. Cross-domain handoff ผ่าน URL param

เมื่อกดปุ่ม "ซื้อออนไลน์" บนหน้า calculator จะ redirect พร้อม param:

```
http://form.local:8081/smartinsure/form.html?vid={MCP_visitor_id}&code=smartsaving101&premiumBand=mid&plan=standard&premium=24800
```

---

## Deploy บน GitHub Pages

1. Push code ขึ้น GitHub repository
2. ไปที่ Settings → Pages → Source: Deploy from branch `main` (หรือ branch ที่ต้องการ)
3. เข้าถึงได้ที่: `https://{username}.github.io/{repo-name}/`

---

## วิธีเชื่อม MCP (Salesforce Interactions)

### 1. วาง Beacon Script

แทน placeholder comment ในทุกหน้า HTML:

```html
<!-- MCP Beacon: วาง Salesforce Interactions beacon script ที่นี่ -->
<!-- <script src="https://YOUR_BEACON_URL/beacon.js"></script> -->
```

ด้วย beacon จริงจาก Salesforce Interactions account ของคุณ:

```html
<script src="https://cdn.evgnet.com/beacon/YOUR_ORG/YOUR_DATASET/scripts/evergage.min.js"></script>
```

### 2. วาง Sitemap ใน MCP UI

นำ config จากไฟล์ `mcp/sitemap.js` ไปวางใน **Salesforce Interactions → Sitemap** พร้อมเติม:
- `cookieDomain`: domain จริงของเว็บ (เช่น `bangkoklife.com`)
- Dataset / Beacon URL จาก account

### 3. สร้าง Catalog "Product" ใน MCP

Sitemap จะส่ง catalog item อัตโนมัติเมื่อ `pageType = "product-detail"` — ต้องสร้าง Catalog object ชื่อ `Product` ใน MCP ก่อน

---

## Test Checklist

- [ ] ทุกหน้า fire page view ตรง pageType (ดูใน MCP → Real-time → Activity)
- [ ] หน้า product-detail สร้าง catalog item view (เห็น product code ใน MCP Catalog)
- [ ] `Calculate Premium` fire พร้อม attributes: gender, ageBand, premiumBand, productCode
- [ ] `Click Buy Online` fire ก่อน redirect + URL มี `vid` param
- [ ] ฟอร์ม fire `Form Step` ครบ step 1→5 (พิสูจน์ virtual pageview ด้วย `reinit()`)
- [ ] `Purchase` fire บนหน้า confirmation พร้อม orderValue
- [ ] (local 2-origin) visitor ID เดียวกันต่อเนื่องข้าม origin
- [ ] Funnel report ใน MCP เห็น drop-off ครบทุก step

---

## สินค้า Mock Catalog

| code | ชื่อ | category | ลดหย่อนภาษี | โปรโมชัน |
|---|---|---|---|---|
| smartsaving101 | BLA SmartSaving 10/1 | savings | ✓ | ✓ |
| smartsaving102 | BLA SmartSaving 10/2 | savings | ✓ | - |
| completehealth | BLA Complete Health | health | - | ✓ |
| fastreturn102 | BLA Fast Return 10/2 | savings | ✓ | - |
| happypension | BLA Happy Pension | pension | ✓ | ✓ |
| smartreturn105 | BLA Smart Return 10/5 | savings | - | - |

---

## สิ่งที่ต้องทำใน MCP UI เอง (หลัง deploy)

1. วาง sitemap.js + เติม beacon/dataset
2. สร้าง **Catalog "Product"** (รับ catalog block จาก sitemap)
3. สร้าง **Segment**: เช่น "calculated-not-bought", "viewed-savings"
4. สร้าง **Campaign + Experience (A/B)**: เช่น sticky CTA บน calculator zone `calculator_nudge`
5. ตั้ง **Goal** = action `Purchase` (business goal) หรือ `Calculate Premium` (micro goal)
6. ดู **Funnel report**: View Product Detail → Calculate Premium → Click Buy Online → View Application Step → Purchase

---

*Mock build สำหรับทดสอบ MCP tracking เท่านั้น — ไม่มีข้อมูลจริงหรือ backend*
