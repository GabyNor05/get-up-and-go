<img width="1280" height="425" alt="Github banner" src="https://github.com/user-attachments/assets/ff59982f-dbfd-4b19-a074-cfe4cd14a8e9" />

# Get up & Go

> A cross-platform ecosystem featuring a **React Native mobile application** and a companion **React web portal** for social activity planning, real-time event discovery, dynamic circle management, and community engagement.

---

## ℹ️ About the Project

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

## 🛠️ Tech Stack

* **Mobile App:** React Native, Expo / React Native CLI, `lucide-react-native`
* **Web Portal:** React.js, Render, `lucide-react`
* **State & Navigation:** React Context / Hooks, React Navigation
* **Theme & Styling:** Tailwind CSS, Daisy UI
* **Language:** JavaScript (ES6+)

| Layer | Technology | Purpose |
|-------|------------|---------|
| Mobile App | React Native, Expo (SDK 54), NativeWind v4, `lucide-react-native` | Cross-platform iOS/Android UI, native components, styling |
| Web Portal | React.js, Tailwind CSS, `lucide-react` | Admin dashboard, circle management, event governance |
| State & Navigation | React Context/Hooks, Expo Router v3 | File-based navigation, state management, deep linking |
| Database | Firestore | Real-time NoSQL database for Goers, Circles, and Happenings |
| Theme & Design System | Custom `shared-theme.js` (Tailwind tokens) | Centralised colours, custom typography (A Day Without Sun), and dark mode|
| Architecture | Monorepo | Shared components, unified configurations, code reusability |
| Hosting & Deployment | Render (Web) | Cloud hosting, CI/CD builds, and app distribution |


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

## 🚀 Getting Started
Prerequisites
Make sure you have the following installed on your development machine:

* Node.js (v18 or higher)
* npm or yarn

For Mobile Development:
* Expo Go app (or iOS Simulator / Android Studio emulator)

### Installation

1. **Clone the repository:**
   ```bash
    git clone [https://github.com/your-username/get-up-and-go.git](https://github.com/your-username/get-up-and-go.git)
   ```
2. **Install Dependencies:**
   ```bash
    npm install
   ```
3. **Environment Configuration:**
   Copy .env.example in apps/mobile and apps/web to create local .env files:
   ```bash
    cp apps/mobile/.env.example apps/mobile/.env
   ```
### Running Locally
- **Mobile App**
  ```bash
    cd apps/mobile && npx expo start
   ```
  _Press a for Android Emulator, i for iOS Simulator, or scan the QR code with Expo Go._
- **Web Portal**
  ```bash
    cd apps/web && npm start
   ```

---
## 📽️ Mockups & Demo video

<img width="4808" height="3384" alt="Mockup 01" src="https://github.com/user-attachments/assets/8f303d92-f6e3-40b2-84f7-525fe6d4b383" />

<img width="4808" height="3384" alt="Mockup 02" src="https://github.com/user-attachments/assets/596c4982-18dc-4cde-9083-6a68cc8f756b" />

<img width="4808" height="3384" alt="Mockup 03" src="https://github.com/user-attachments/assets/713d1bdf-d6ff-46ed-be28-0803ebc425b3" />

<img width="4808" height="3384" alt="Mockup 04" src="https://github.com/user-attachments/assets/375d43c8-782b-4168-a708-835ee3f7a287" />

<img width="4808" height="3384" alt="Mockup 05" src="https://github.com/user-attachments/assets/d9a6b7da-fcd4-4bdf-b962-2e89e6d25ee2" />



[Demo Video](https://youtu.be/gdJVw8wriyY)

---
## 👏 Proud Moments

* **Monorepo Architecture:** Successfully established a unified monorepo structure housing both the Expo React Native mobile application and the React web portal with shared design tokens.
* **Custom Design System:** Implemented a centralised theme system (`shared-theme.js`) using NativeWind, seamlessly integrating custom display typography (*A Day Without Sun*) alongside a full light/dark mode colour palette.
* **File-Based Routing:** Architected a modular file-based navigation structure with Expo Router, incorporating nested stack, drawer, and modal screens (such as circle management, invite flows, and goer profiles).
* **Domain-Driven App:** Created a social, gamified platform centred around real-world activity, feature-rich circle communities, and progress tracking tailored to active "goers".

---

## 🧪 Challenges & Solutions

* **Monorepo Dependency & Expo Versioning:** Managing shared configurations and ensuring package compatibility across mobile and web environments was tricky (e.g., Babel presets and Expo SDK requirements). I resolved this by leveraging `npx expo install` to keep dependencies strictly aligned with expected Expo versions and isolating app configs cleanly.
* **Context Scoping in Dynamic Routes:** Structuring nested navigation for dynamic routes—like passing both a circle ID and a goer ID across drawers and modals—presented potential state-scoping challenges. I solved this by leveraging Expo Router's folder hierarchy (`[id]/goer/[goerId]`) and `useLocalSearchParams` to cleanly access route parameters across sub-screens.
* **Cross-Platform Layout Consistency:** Ensuring custom fonts, Tailwind utility classes, and custom type scales rendered uniformly across both iOS/Android native views and web browsers required deliberate setup. I resolved this by utilising NativeWind presets and carefully mapping responsive type scales with exact line heights.
* **Time Constraints:** The initial scope suits more of an 8-week sprint instead of 3-4 weeks; it ended up being very focused on major feature delivery compared to the full product. There had to be triage to determine what was most essential for the deliverable to ensure it would meet the deadline.

---

## 🧭 Reflection

Building **Get Up & Go** marks a major milestone in moving beyond traditional web development into cross-platform mobile ecosystem architecture. Working within a monorepo structure taught me how to manage reusable assets, shared theme tokens, and complex file-based navigation patterns using Expo Router. 

Navigating the nuances of native styling, state scoping inside nested drawers/modals, and keeping dynamic schemas aligned with domain models significantly improved my debugging skills and architectural planning. This project pushed me to think holistically about user experience—balancing real-time social features with accessible, clean, and responsive design systems across multiple devices.

---

## 🏁 Conclusion

**Get Up & Go** successfully bridges the gap between digital social connection and active, real-world community building. By leveraging a modern tech stack centred on **Expo Router**, **NativeWind**, and a scalable monorepo structure, the project demonstrates how technical rigour and thoughtful UI/UX design can come together to solve everyday challenges like routine burnout and social isolation.

Beyond establishing a robust foundation for dynamic circles, gamified progress tracking, and event discovery, the architecture is purposefully crafted for long-term scalability. Whether expanding the partner ecosystem for local event organisers or introducing deeper algorithmic discovery, Get Up & Go stands as a fully realised, production-ready framework designed to inspire people to break out of their routines and **get moving together**.

---
## ✨ Acknowledgements

**Caylin Oosthuizen** commissioned for the making of the G&G logo — [View LinkedIn](https://www.linkedin.com/in/caylin-oosthuizen-b905b7411?utm_source=share_via&utm_content=profile&utm_medium=member_android)

**Tsungai Katsuro**, my semester 2 lecturer, who guided us through this brief.

**William Basson**, my semester 1 lecturer, who provided much-needed feedback and guidance for the project.

---

🔒 License
Distributed under the MIT License. See `LICENSE` for more information.
