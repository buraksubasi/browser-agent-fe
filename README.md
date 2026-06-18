# Browser Agent — Frontend

> Doğal dil komutlarıyla web'i kontrol eden AI agent'ının Next.js arayüzü.

---

## Proje Nedir?

Browser Agent; kullanıcıdan aldığı doğal dil görevini Gemini 2.5 Flash ile yorumlar, Playwright MCP Server aracılığıyla gerçek bir tarayıcıda adım adım çalıştırır ve her adımı canlı olarak ekranda gösterir.

```
Kullanıcı: "Amazon'da kulaklık ara, ilk ürünü sepete ekle"
    ↓
Gemini: Sayfanın screenshot'ını görür
    ↓
Gemini: "search_box'a yaz → enter → ilk ürüne tıkla → sepete ekle"
    ↓
Playwright MCP: Her adımı tarayıcıda gerçekleştirir
    ↓
Kullanıcı: Adımları ve sonucu arayüzde canlı görür
```

---

## Tech Stack

### Frontend (bu repo)

| Teknoloji | Versiyon | Kullanım Amacı |
|---|---|---|
| **Next.js** | 15+ (App Router) | React framework |
| **TypeScript** | 5+ | Tip güvenliği |
| **Tailwind CSS** | 4+ | Stil |
| **WebSocket API** | — | Backend'den canlı adım akışı |

### Backend (ayrı repo)

| Teknoloji | Kullanım Amacı |
|---|---|
| **Python 3.11+** | Tüm backend dili |
| **FastAPI** | REST API + WebSocket sunucusu |
| **Gemini 2.5 Flash** | Multimodal AI — screenshot'ı görür, karar verir |
| **Playwright** | Gerçek Chromium tarayıcı kontrolü |
| **MCP (Model Context Protocol)** | Agent ↔ tarayıcı araç katmanı |
| **Uvicorn** | ASGI sunucusu |

### Altyapı

| Teknoloji | Kullanım Amacı |
|---|---|
| **Docker / Docker Compose** | Backend + Frontend konteyner orkestrasyonu |
| **WebSocket** | Adım akışı (`/agent/stream`) |

---

## Proje Dosya Yapısı

```
browser-agent/
│
├── backend/                        ← Python (ayrı repo)
│   ├── main.py                     ← FastAPI entry point + WebSocket
│   ├── agent.py                    ← Gemini agent loop (max 15 adım)
│   ├── mcp_server.py               ← Playwright MCP Server
│   ├── mcp_client.py               ← MCP bağlantı yöneticisi
│   └── requirements.txt
│
├── frontend/                       ← Bu repo (Next.js)
│   ├── app/
│   │   ├── page.tsx                ← Ana sayfa (chat + screenshot)
│   │   └── components/
│   │       ├── ChatWindow.tsx      ← Görev girişi ve mesaj geçmişi
│   │       ├── ScreenshotViewer.tsx← Canlı tarayıcı ekranı
│   │       └── StepTracker.tsx     ← Agent adım takibi
│   └── package.json
│
└── docker-compose.yml
```

---

## Playwright MCP Araçları

Backend'deki MCP Server'ın sunduğu araçlar — Gemini bunları çağırır:

| Araç | Ne Yapar |
|---|---|
| `navigate` | URL'e git |
| `screenshot` | Sayfanın görüntüsünü base64 olarak al |
| `click` | CSS selector ile elemente tıkla |
| `type` | Input alanına yaz |
| `scroll` | Sayfayı kaydır |
| `get_text` | Sayfadaki tüm metni al |
| `wait_for` | Element görünene kadar bekle |
| `evaluate` | Sayfada JS çalıştır |
| `pdf` | Sayfayı PDF olarak kaydet |

---

## Backend API

| Endpoint | Tür | Açıklama |
|---|---|---|
| `POST /agent/run` | REST | Görevi çalıştır, tamamlanınca döner |
| `WS /agent/stream` | WebSocket | Görevi çalıştır, adımları canlı aktar |

Frontend `WS /agent/stream` üzerinden bağlanır ve her adımı (`navigate`, `screenshot`, `click` ...) gerçek zamanlı alır.

---

## Ortam Değişkenleri

`.env.local` dosyası oluşturup aşağıdaki değişkeni ekle:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Kurulum ve Çalıştırma

### Geliştirme (frontend tek başına)

```bash
npm install
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde açılır.

### Docker ile tam stack

```bash
# Proje kökünde (docker-compose.yml yanında)
GEMINI_API_KEY=your_key docker compose up --build
```

| Servis | Port |
|---|---|
| Frontend (Next.js) | `3000` |
| Backend (FastAPI) | `8000` |

---

## Arayüz Yapısı

```
┌─────────────────────────────────────────────────┐
│  Browser Agent                                  │
├──────────────────────┬──────────────────────────┤
│  Adım Takibi         │  Canlı Tarayıcı Ekranı   │
│                      │                          │
│  ✅ navigate         │  ┌────────────────────┐  │
│     amazon.com       │  │                    │  │
│                      │  │   Sayfa görüntüsü  │  │
│  📸 screenshot       │  │                    │  │
│  [önizleme]          │  └────────────────────┘  │
│                      │                          │
│  🖱️ click            │                          │
│     #search-box      │                          │
│                      │                          │
│  ⌨️ type             │                          │
│     "kulaklık"       │                          │
│                      │                          │
│  ✅ Tamamlandı       │                          │
├──────────────────────┴──────────────────────────┤
│  [Görev gir...]                    [▶ Çalıştır] │
└─────────────────────────────────────────────────┘
```

---

## Geliştirme Yol Haritası

| Aşama | İçerik |
|---|---|---|
| 1 | Playwright MCP Server (Python) |
| 2 | MCP Client bağlantısı |
| 3 | Gemini agent loop |
| 4 | FastAPI + WebSocket |
| 5 | Next.js arayüzü |
| 6 | Docker paketleme |


---

## Kaynaklar

| Kaynak | Link |
|---|---|
| Gemini 2.5 Flash | https://ai.google.dev/gemini-api/docs |
| MCP Python SDK | https://github.com/modelcontextprotocol/python-sdk |
| Playwright Python | https://playwright.dev/python |
| Gemini Tool Use | https://ai.google.dev/gemini-api/docs/function-calling |
| Next.js Docs | https://nextjs.org/docs |
