# SkyLine ✈️

SkyLine is a full-stack, serverless web application designed to help travelers with low passport mobility discover safe, affordable, and compliant flight routes

---

## 🚀 Project Overview
Traditional flight search engines often fail to account for complex visa restrictions and transit requirements, leading to unexpected travel hurdles. I built **SkyLine** to solve this problem by integrating a custom visa and transit rule engine directly into the flight discovery process[cite: 2]. The application evaluates flight routes against a user's active passport profile before ranking or recommending options

---

## 🛠️ Architecture & Tech Stack

* **Frontend:** React, Vite, Leaflet (for interactive mapping), and a custom design system.
* **Backend:** Netlify serverless functions acting as secure API proxies to handle backend logic and external data requests
* **Database & Auth:** Supabase (PostgreSQL) featuring Row Level Security (RLS) to safeguard user profiles and preferences
* **Integrations:** Duffel API (for real-time flight search and booking data), OurAirports dataset (for airport mapping/metadata), and Stripe Elements (for secure payments)

---

## ✨ Key Features

* **Visa-Aware Route Filtering:** Automatically cross-references flight itineraries against the user's specific passport profile to assess transit and entry feasibility
* **Dynamic Price-by-Day Calendars:** Utilizes backend serverless functions (such as `netlify/functions/flights-cheapest-dates.js`) to power grid views for finding the most cost-effective travel windows
* **Interactive Discovery:** Features visual routing and mapping tools to give users a clear picture of their journey layout
* **Secure Transactions:** Integrated payment processing flows using Stripe

---

## 📂 Project Structure

```text
skyline/
├── netlify/
│   └── functions/          # Serverless backend endpoints (e.g., flight search, data proxies)
├── src/
│   ├── components/         # Reusable React components (FlightCalendar.jsx, maps, UI elements)
│   ├── assets/             # Static assets and icons
│   └── App.jsx             # Main application entry and router
├── public/                 # Static public files and datasets
└── package.json            # Project dependencies and scripts


## Getting Started & Installation
- Clone the repo:
```bash
git clone [https://github.com/your-username/skyline.git](https://github.com/your-username/skyline.git)
cd skyline
```

- Install dependencies:
```bash
npm install
```

- Configure Environment Variables:
Create a .env file in the root directory and add your required keys (such as Supabase credentials, Duffel API tokens, and Stripe keys):
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
DUFFEL_API_KEY=your_duffel_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```
- Run the development server:
```bash
npm run dev
```
