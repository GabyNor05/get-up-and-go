# Get Up & Go (`get-up-and-go`)

> A cross-platform ecosystem featuring a **React Native mobile application** and a companion **React web portal** for social activity planning, real-time event discovery, dynamic circle management, and community engagement.

---

## 📱 About the Project

**Get Up & Go** is designed to bridge the gap between digital interaction and real-world activity. Whether discovering local hikes, joining gaming nights, or keeping track of group milestones, Get Up & Go provides the tools needed to get people moving together.

### Key Features

* **📱 Mobile Application (React Native / iOS & Android)**
  * **Event Discovery:** Filter events by category (Nature, Sport, Music, Games, Food) and proximity.
  * **Dynamic Circles:** Create and manage social circles, track rank/activity, and invite friends.
  * **Customisation & Accessibility:** Built-in dark mode toggle, dynamic font scaling, and custom styling presets.
  * **Security & Controls:** Fine-grained privacy controls, biometrics toggle, and data-sharing preferences.

* **💻 Web Portal (React Web)**
  * **Administrative Dashboard:** Manage events, track circle metrics, and monitor community trends.
  * **Large-Scale Event Management:** Create and syndicate events across regional hubs.
  * **User & Circle Governance:** Manage global accounts and system preferences from any desktop browser.

---

## 🛠️ Tech Stack

* **Mobile App:** React Native, Expo / React Native CLI, `lucide-react-native`
* **Web Portal:** React.js, Render, `lucide-react`
* **State & Navigation:** React Context / Hooks, React Navigation
* **Theme & Styling:** Tailwind CSS, Daisy UI
* **Language:** JavaScript (ES6+)

---

## UI Styling

The visual identity of Get Up & Go (G&G) is crafted to feel inviting, motivating, and lighthearted. Designed to encourage users to break out of stay-at-home routines, the aesthetic avoids overly aggressive or clinical tech aesthetics in favour of a playful, organic environment. By pairing a soft, high-contrast canvas with a vibrant secondary accent, the design system creates a friendly, low-pressure atmosphere that turns real-world exploration and habit-breaking into an enjoyable, rewarding journey. 

<img width="1440" height="1024" alt="Tile - Yale" src="https://github.com/user-attachments/assets/7eab1439-afe7-4db2-9b0a-827c1bbdda85" />

#### Colours:
The G&G palette prioritises accessibility, hierarchy, and visual comfort by leveraging structured primary, secondary, and neutral spectrums. The heavy reliance on distinct tints and shades ensures high contrast for readability without visual clutter:
* **Beige (#F4F0DD canvas):** Serves as a warm, off-white background spectrum that reduces eye strain compared to harsh #FFFFFF screens, offering a gentle, grounded canvas.
* **Indigo (#A88AED primary):** Used for primary action buttons, brand accents, and active UI elements to convey trust, clarity, and focus.
* **Celery (#A6C261 secondary):** Represents growth and achievement, heavily utilised for gamification elements (Go-Points, level progress bars, and success badges) to provide positive reinforcement.
* **Tints & Shades:** Extended colour spectrums (from deep midnight indigo to soft mint green and neutral charcoal) allow for seamless dark mode adaptations, subtle state changes (hover/pressed buttons), and accessible text contrast ratios across all components.

#### Typography:
* **A Day Without Sun (Headers & Display Copy):** Designed by Cosimo Lorenzo Pancini and Debora Manetti (Adobe Fonts), this expressive display typeface gives G&G its signature playful tone. Its organic, handwritten quality makes headers feel personal and non-intimidating, perfectly aligning with a soft habit-breaking narrative.
* **Arial (Body Copy & Microcopy):** Paired directly with the display font to ground the UI with clean, crisp structure. Arial's neutral, highly legible sans-serif letterforms ensure that event details, settings text, and navigation labels remain effortless to scan on mobile screens at any scale.

#### Iconography:
* **Lucide Icons System:** To complement the visual hierarchy, G&G utilises the Lucide icon library. Chosen for its clean, uniform stroke weights and geometric curves, Lucide icons seamlessly integrate with both Arial and A Day Without Sun.
* **One-Handed Usability:** Icons are used consistently across bottom navigation items, drawer triggers, and action buttons to ensure instant visual recognition—allowing users to comfortably navigate the app one-handed without relying heavily on reading dense text labels. 


---

## 📂 Repository Structure

```text
get-up-and-go/
├── apps/
│   ├── mobile/          # React Native iOS/Android app
│   └── web/             # React Web Portal
├── packages/
│   ├── shared-ui/       # Reusable UI components & design system
│   └── config/          # Shared constants, themes, and configs
└── README.md
```

---

## 🚀 Getting Started
Prerequisites
Make sure you have the following installed on your development machine:

* Node.js (v18 or higher)
* npm or yarn

For Mobile Development:
* Expo Go app (or iOS Simulator / Android Studio emulator)

---

---

🔒 License
Distributed under the MIT License. See LICENSE for more information.
