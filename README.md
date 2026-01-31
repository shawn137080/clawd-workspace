# 🦾 Zac — AI Executive Assistant

Welcome to the **clawd-workspace**. This is the digital command center for **Zac**, a personal AI Executive Assistant powered by Clawdbot.

Zac isn't just a chatbot; he's a proactive, resourceful, and slightly opinionated AI designed to handle research, monitoring, and task management without constant hand-holding.

## 🚀 Projects & Capabilities

This workspace is currently focused on two primary mission-critical tracks:

### 1. 🛒 Ecommerce & Dropshipping Research
Automated monitoring of market trends and product discovery.
- **Product Discovery:** Daily identification of high-potential products.
- **TikTok Trends:** Monitoring viral patterns to catch waves early.
- **Competitor Analysis:** Keeping an eye on the landscape to maintain an edge.

### 2. 🏠 GTA/Toronto Rental Property Hunting
A localized engine for navigating the competitive Greater Toronto Area real estate market.
- **Multi-Source Scraping:** Integrated monitoring across MLS and 51.ca.
- **Real-time Alerts:** Immediate Telegram notifications for new listings that match criteria.
- **Market Intelligence:** Rent vs. Buy analysis and localized market reporting.

---

## 🛰️ Mission Control Dashboard

The workspace features a centralized dashboard (`DASHBOARD.html`) for at-a-glance status updates.

- **How to use:** Open `DASHBOARD.html` in any browser to see the current status of all active projects, priority levels, and upcoming tasks.
- **Live Sync:** Zac automatically updates this dashboard during his heartbeat checks to ensure the data stays fresh.

---

## 💓 Proactive Heartbeat System

Unlike standard AI assistants that wait for a prompt, Zac uses an **Automated Heartbeat System**.

- **How it works:** Every few hours, the system triggers a "heartbeat" check. Zac reads `HEARTBEAT.md`, evaluates the current state of projects, and performs background tasks.
- **Proactive Reporting:** If a project status changes or an urgent listing is found, Zac will reach out on Telegram immediately.
- **Status Checks:** If nothing is urgent, Zac maintains a quiet background presence, updating `memory/heartbeat-state.json` and refreshing the Mission Control dashboard.

---

## 📂 Project Structure

```text
.
├── 📂 ecommerce/         # Research plans and trend data
├── 📂 rental/            # Property hunting logic and market analysis
├── 📂 memory/            # Zac's persistent memory and heartbeat state
├── 📂 skills/            # Custom tool extensions (search, sonos, etc.)
├── 📄 DASHBOARD.html     # Mission Control (The visual UI)
├── 📄 HEARTBEAT.md       # Logic for proactive checks
├── 📄 TASKS.md           # The global to-do list
├── 📄 SOUL.md            # Zac's personality and core guidelines
└── 📄 IDENTITY.md        # Zac's profile and vibe settings
```

---

## 🛠️ Setup & Usage

This workspace is designed to run within the **Clawdbot** environment. 

1. **Vibe Check:** Zac's personality is defined in `SOUL.md`. He's professional but casual—think of him as a high-level employee, not a tool.
2. **Persistence:** Zac "wakes up" fresh each session. He relies on the `memory/` folder to maintain continuity.
3. **Execution:** Commands are executed via the Clawdbot gateway, allowing Zac to manage files, search the web, and interact with the local filesystem.

---

*“Stay hungry, stay foolish, and let me handle the spreadsheets.”* — **Zac** 🦾
