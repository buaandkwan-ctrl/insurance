# BLA Insurance Mock Funnel — README

> **MOCK / DEMO PROJECT**
> โปรเจกต์นี้เป็นระบบสาธิต (mock funnel) สำหรับทดสอบ Salesforce Interactions (MCP) Tracking บนเว็บไซต์ประกันชีวิต Bangkok Life Assurance
> ไม่มีการเก็บข้อมูลจริง ไม่มีการชำระเงินจริง และไม่ใช่เว็บไซต์ทางการของ BLA

---

## 1. ภาพรวมโปรเจกต์ (Project Overview)

```
insurance/
├── index.html                 # หน้าแสดงผลิตภัณฑ์ 6 รายการ
├── product.html               # หน้ารายละเอียดผลิตภัณฑ์ (dynamic via ?code=)
├── calculator.html            # หน้าคำนวณเบี้ยประกัน
├── smartinsure/
│   ├── form.html              # SPA 5-step ใบสมัครประกัน
│   └── confirmation.html      # หน้ายืนยันการสมัคร
├── assets/
│   ├── datalayer.js           # window.blaDataLayer + window.blaTrack helpers
│   └── styles.css             # BLA brand styles (dark blue #003087, gold #C8A84B)
├── mcp/
│   └── sitemap.js             # MCP Sitemap config (วางใน Salesforce Interactions UI)
└── README.md
```

### DataLayer Flow
| หน้า | `blaDataLayer.page.type` | Event ที่ยิง |
|------|--------------------------|-------------|
| index.html | `"home"` | View Home (จาก beacon/sitemap) |
| product.html | `"product-detail"` | View Product Detail + catalog object |
| calculator.html | `"calculator"` | View Calculator → Calculate Premium → Click Buy Online |
| smartinsure/form.html | `"application"` | Form Step (ทุก step) + reinit() |
| smartinsure/confirmation.html | `"confirmation"` | Purchase |

---

## 2. รันบน Single Origin (วิธีง่าย)

```bash
cd /path/to/insurance
python3 -m http.server 8080
```

เปิด browser: [http://localhost:8080](http://localhost:8080)

---

## 3. รันแบบ 2 Origin (Cross-Domain Test)

ใช้เพื่อทดสอบ cross-domain cookie sharing ของ Salesforce Interactions

### 3.1 เพิ่ม /etc/hosts

```
127.0.0.1   main.local
127.0.0.1   form.local
```

### 3.2 รัน Main Site

```bash
cd /path/to/insurance
python3 -m http.server 8080
# เข้าถึงที่: http://main.local:8080
```

### 3.3 Copy และรัน SmartInsure (แยก origin)

```bash
cp -r smartinsure /tmp/smartinsure-standalone
cd /tmp/smartinsure-standalone
python3 -m http.server 8081
# เข้าถึงที่: http://form.local:8081
```

> **หมายเหตุ:** ต้องอัพเดต URL ใน calculator.html ให้ชี้ไปที่ `http://form.local:8081/form.html?...` แทน relative path

### 3.4 อัพเดต MCP cookieDomain

ใน `mcp/sitemap.js` เปลี่ยน:
```js
SalesforceInteractions.init({
  cookieDomain: ".local"   // ← เปลี่ยนจาก "bangkoklife.com"
})
```

---

## 4. Deploy บน GitHub Pages

```bash
# Push to GitHub
git add .
git commit -m "feat: BLA mock funnel"
git push origin main

# ใน GitHub repo: Settings → Pages → Source: Deploy from branch → main → / (root)
# URL จะเป็น: https://<username>.github.io/<repo-name>/
```

> **หมายเหตุ:** GitHub Pages ใช้ single domain ดังนั้นไม่รองรับ cross-domain test (ใช้ single origin mode)

---

## 5. ตั้งค่า MCP (Salesforce Interactions)

### 5.1 เพิ่ม Beacon Script

วาง beacon script tag ของ Salesforce Interactions **ก่อน** `</head>` ในทุกหน้า
(ค้นหา comment `<!-- MCP Beacon: วาง Salesforce Interactions beacon script ที่นี่ -->`)

```html
<!-- แทนที่ YOUR_BEACON_URL ด้วย URL จาก Salesforce Interactions account จริง -->
<script src="https://YOUR_BEACON_URL/beacon.js"></script>
```

### 5.2 ตั้งค่า Dataset

ใน Salesforce Interactions:
1. ไปที่ **Setup → Interaction Studio → Datasets**
2. สร้าง dataset สำหรับ BLA
3. Copy beacon URL และวางในทุก HTML page

### 5.3 Upload Sitemap

1. Copy เนื้อหาจาก `mcp/sitemap.js`
2. ไปที่ Salesforce Interactions → **Sitemap**
3. วาง code และแทนที่ `"bangkoklife.com"` ด้วย domain จริง
4. Save & Publish

### 5.4 ตั้งค่า Content Zones

สร้าง content zones ต่อไปนี้ใน Salesforce Interactions:
- `home_hero` — hero banner บนหน้าหลัก
- `product_reco` — product recommendations บนหน้า product detail
- `calculator_nudge` — nudge/CTA บนหน้า calculator

---

## 6. Test Checklist

### หน้าหลัก (index.html)
- [ ] `window.blaDataLayer.page.type === "home"` ก่อน beacon โหลด
- [ ] แสดงการ์ดผลิตภัณฑ์ 6 รายการครบ
- [ ] กดการ์ดแต่ละใบ → ไปที่ `product.html?code=<code>` ถูกต้อง
- [ ] Console แสดง `[blaDataLayer] Initialized: {page: {type: "home", locale: "th"}}`

### หน้ารายละเอียด (product.html)
- [ ] `blaDataLayer.product.code` ตรงกับ URL param `?code=`
- [ ] `blaDataLayer.page.type === "product-detail"`
- [ ] แสดงชื่อ category badge และ tax/promo badges ถูกต้อง
- [ ] ปุ่ม "คำนวณเบี้ยประกัน" → ไปที่ `calculator.html?code=<code>`

### หน้าคำนวณ (calculator.html)
- [ ] `blaDataLayer.page.type === "calculator"`
- [ ] กด "คำนวณ" ก่อนเลือกข้อมูล → แสดง alert ขอให้กรอก
- [ ] เลือก gender + age band + plan → กดคำนวณ → แสดงเบี้ยประมาณ
- [ ] `blaTrack.calculate(...)` ยิง event (ดูใน console)
- [ ] `blaDataLayer.calc.premiumBand` อัพเดตหลังคำนวณ
- [ ] ปุ่ม "ซื้อออนไลน์" → `blaTrack.buyClick(...)` ยิง event → redirect ไป form.html
- [ ] URL ของ form.html มี `vid`, `code`, `premiumBand`, `plan`, `premium` params

### หน้าใบสมัคร (smartinsure/form.html)
- [ ] `blaDataLayer.page.type === "application"`
- [ ] `blaDataLayer.form.step === 1` ตอนโหลด
- [ ] Step indicator แสดงขั้นตอนปัจจุบันถูกต้อง
- [ ] กด "ต่อไป" → `blaTrack.formStep(n, stepName)` ยิง event
- [ ] `blaDataLayer.form.step` อัพเดตทุก step
- [ ] `SalesforceInteractions.reinit()` ถูกเรียก (หรือ log ถ้าไม่ได้โหลด beacon)
- [ ] Step 4 (review) แสดงข้อมูลผลิตภัณฑ์จาก URL params
- [ ] Step 5 (payment) แสดงยอดรวมพร้อม VAT
- [ ] กด "ยืนยัน" → redirect ไป `confirmation.html?code=...&value=...`

### หน้ายืนยัน (smartinsure/confirmation.html)
- [ ] `blaDataLayer.page.type === "confirmation"`
- [ ] `blaDataLayer.order.confirmed === true`
- [ ] `blaTrack.purchase({code, value})` ยิงทันทีที่หน้าโหลด
- [ ] แสดงหมายเลขคำขอ (mock), ชื่อผลิตภัณฑ์, มูลค่าเบี้ย, วันที่

### Cross-Domain (ถ้าทดสอบ 2 origin)
- [ ] Cookie จาก `main.local` อ่านได้จาก `form.local` (ผ่าน MCP parent domain)
- [ ] `blaTrack.formStep()` ส่ง user identity ข้าม domain ได้

---

## 7. ข้อมูล Mock Products

| Code | ชื่อ | หมวด | ลดหย่อนภาษี | โปรโมชัน |
|------|------|------|:-----------:|:--------:|
| smartsaving101 | BLA SmartSaving 10/1 | savings | ✓ | ✓ |
| smartsaving102 | BLA SmartSaving 10/2 | savings | ✓ | — |
| completehealth | BLA Complete Health | health | — | ✓ |
| fastreturn102 | BLA Fast Return 10/2 | savings | ✓ | — |
| happypension | BLA Happy Pension | pension | ✓ | ✓ |
| smartreturn105 | BLA Smart Return 10/5 | savings | — | — |

---

*สร้างเพื่อการสาธิต MCP Tracking — Bangkok Life Assurance Demo Funnel*
