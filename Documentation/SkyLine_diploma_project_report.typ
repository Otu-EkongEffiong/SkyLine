//+==========================================+
//           DOCUMENT STYLING
//+==========================================+
#set document(title: [SkyLine Diploma Project Documentation])
#set page(paper: "a4")
#set par(
  justify: true,
  leading: 0.52em,
)
#set text(
  font: "Calibri",
  size: 11pt,
)


#let hr = line(length: 100%, stroke: 1pt + gray.transparentize(10%))


//code block styling
#show raw.where(block: true): it => block(
  fill: rgb("#fff1ff"),
  inset: 10pt,
  radius: 4pt,
  width: 100%,
  it
)


//+==========================================+
//               TITLE STYLING
//+==========================================+
#show title: set text(size: 17pt)
#show title: set align(center)
#show title: set block(below: 1.2em)

//+==========================================+
//               LOGO
//+==========================================+
#show image: set align(center)
#image("vizja.jpg", width: 40%)

//+==========================================+
//         AUTHOR & SUPERVISOR LIST
//+==========================================+
#grid(
  columns: (1fr),
  align(center)[
    *Branch of Study:* Computer Science \
    *Course:* IT Project C1 \
    *Student Name:* Otu-ekong Joseph Effiong \
    *Student ID:* 42468 \
    *Course Type:* Full-time course \
    *Institution Name:* University of Economics and Human Sciences in Warsaw \
    Poland, Warsaw, Ul. Okopowa 59 \
    Documentation for the diploma project prepared under the supervision of *Marcin Kacprowicz* \
    *Academic Year:* 2026
  ],
)

= SkyLine: A Visa-Aware Low-Cost Flight Planning Web Application for Travelers with Low Passport Mobility

#set heading(numbering: "1.")




#hr

//+=================================================+
// 1. Basic Information
// +===============================================+
= Basic Information

== Project Name

SkyLine: a visa-aware low-cost flight planning web application for travelers with low passport mobility.

== Project Goal

The goal of the project is to create a modern web application that helps foreigners and travelers 
with low passport strength find affordable, realistic, and legally safer flight routes. 
The application combines flight search, passport and visa eligibility checks, airport transit 
analysis, and route visualization to recommend travel plans that fit the user's nationality, 
existing visas, residence status, travel dates, and budget.

Unlike a standard flight search engine that only sorts results by price or duration, SkyLine 
evaluates whether a traveler is likely to be allowed to enter or transit through the countries 
included in the route. The system is designed to reduce the risk of choosing a cheap route that 
requires a transit visa, creates a self-transfer problem, or sends the traveler through an airport
 that is unsuitable for their passport situation.

== Brief Description of the Project

SkyLine is a full-stack web application for visa-aware flight planning. A user creates a traveler 
profile containing passport country, nationality, residence country, passport expiry date, and 
existing visas or residence permits. The user then enters the origin, destination, preferred dates, 
and budget. The system searches for possible flight routes, checks destination and transit rules, 
scores each route, and presents the safest low-cost options with a clear explanation.

The application includes an airport search module, a route recommendation engine, a visa and 
transit rule engine, a flight path map, saved traveler profiles, saved searches, booking records, 
and payment simulation. Skyline is especially useful for users whose travel options are limited 
by visa requirements and passport mobility. The main output is not only a list of flights, but a 
complete recommended travel plan showing price, duration, layovers, transit countries, visa warnings, 
and the reason why a route is recommended or rejected.




#hr


//+=================================================+
// 2. Competitor Product Analysis
// +===============================================+
= Competitor Product Analysis

== Google Flights

Google Flights is very effective for comparing prices, dates, airlines, and route duration. However, 
it does not deeply personalize recommendations based on the traveler's passport strength, current 
residence status, or existing visas. It may show cheap routes that are legally difficult or 
impossible for some travelers to use.

== Skyscanner and Kiwi.com

Skyscanner and Kiwi.com are strong for low-cost route discovery and flexible date search. 
Kiwi.com is especially useful for creative routing and virtual interlining. However, these 
tools still focus mainly on price and availability. They do not act as a passport-aware travel 
planning assistant and may require the user to manually understand transit visa risk.

== Sherpa and IATA Timatic

Sherpa and IATA Timatic focus on travel restrictions, visa documentation, and entry requirements. 
They are useful for official travel eligibility checks, but they are not complete flight planning 
interfaces. They do not usually optimize a route based on price, layover risk, and passport mobility 
together in one simple workflow.

== FlightAware and OpenSky

FlightAware provides strong operational flight status information, while OpenSky provides aircraft 
position data. These tools are useful for tracking and visualization, but they are not booking systems 
and do not solve visa-aware route planning.

Compared to these products, SkyLine combines the main needs of a specific user group: low-cost 
flight planning, visa and transit awareness, passport-strength consideration, and route visualization. 
The application focuses on helping the user choose a route that is affordable and legally realistic, 
not simply the cheapest result.



#hr

//+=================================================+
// 3. List of Technologies
// +===============================================+
= List of Technologies Used

- React, Vite, JavaScript, Tailwind CSS, shadcn/ui components, and Lucide icons for the frontend.
- Netlify for hosting, HTTPS, deployment, environment variables, and serverless backend functions.
- Supabase for authentication, PostgreSQL database storage, saved traveler profiles, saved searches, 
and booking records.
- Duffel API for flight search, pricing, passenger data, and order creation.
- Kiwi.com Tequila API as an optional provider for low-cost and flexible route discovery.
- FlightAware AeroAPI for flight status, delays, gates, terminals, and operational tracking.
- OpenSky Network for free aircraft position data and map-based tracking.
- OurAirports dataset for airport codes, airport search, city matching, and coordinates.
- Custom visa and transit rule tables in Supabase for the diploma implementation.
- IATA Timatic or Sherpa as possible future professional sources for travel-documentation rules.
- Stripe test mode for payment simulation before booking confirmation.




#hr


//+=================================================+
// 4. Technological stack and justification
// +===============================================+
= Technological Stack and Justification

React and Vite were selected for the frontend because they provide a fast development environment 
and a modern structure suitable for a responsive travel planning interface. Tailwind CSS and 
shadcn/ui allow the interface to be built quickly with consistent components such as forms, 
route cards, alerts, dialogs, filters, and status badges.

Supabase was selected as the database and authentication platform because the Skyline requires 
relational data: users, traveler profiles, visas, passport information, saved searches, route 
recommendations, payments, and bookings. PostgreSQL is a strong fit because these records have 
clear relationships. Supabase Auth also reduces the amount of custom security code needed for 
user accounts.

I chose Duffel as the flight booking provider because it offers a modern REST API, sandbox 
environment, and a clear search, price, and book workflow. For cheaper and more flexible route 
discovery, Kiwi.com Tequila has been added as an optional search provider. FlightAware AeroAPI is 
suitable for operational flight status, while OpenSky is suitable for free aircraft position 
visualization. OurAirports is used locally to avoid unnecessary paid calls for airport lookup 
and to provide route coordinates for the flight path map.

I deployed the application using Netlify as it builds the frontend with `npm run build` and published
from the `dist` directory. Netlify Functions can hold API keys safely and call external 
services without exposing secrets in the browser. This is important because keys for Duffel, 
FlightAware, Stripe, and Supabase service roles must remain private.




#hr


//+=======================================================+
// 5. Key Issues Related to the Implmentation of the project
// +======================================================+
= Key Issues Related to the Implementation of the Project

== Visa-Aware Route Filtering

I had issues when ranking flights only by price, so I built a custom visa and transit rule engine that evaulates
every flight route against the user's active profile passport profile before ranking. Each rule describes
whether a traveler from one country can enter or transit through another country, whether an eVisa is available,
whether visa on arrival is possible, and whether exceptions apply. In a production version, this
data will be replaced or validated by professional services such as IATA Timatic or Sherpa.
The engine considers passport country, destination country, transit countries, existing visas, residence permits,
passport expiry, and whether airport transit is allowed. Rather than relying solely on third-party
APIs for travel restrictions, I built dedicated relational tables in Supabase (visa_rules, passport_strengths, and
transit_rules).

When a user searches for a route, the system checks:
=== Entry requirements for the destination based on the user’s nationality and existing active visas or residence permits.

=== Transit requirements for all intermediate layover countries, verifying if airside transit is allowed without a visa or if a transit visa is required.

=== Passport validity constraints against the travel dates.

Routes that violate entry rules are categorized as “Avoid”, while those with potential risks (such as
required self-transfers or tight layover windows) are tagged with prominent warnings.

//#image()


== Route Scoring and Recommendation Logic
I've given Skyline the ability to rank each route using several factors. Visa safety has the highest weight because a 
legal or transit issue can make an otherwise cheap route unusable. Price is also important because 
the app targets users who need low-cost options. Duration, number of layovers, airport reliability, 
self-transfer risk, and baggage risk are also included.

A practical scoring model is:

- *Visa safety - 45%*: Deducts severe penalties for missing transit visas or dangerous self-transfers
- *Price - 30%*: Normalizes cost against the user’s maximum budget and market average
- *Duration - 15%*: Penalizes long layovers and excessively indirect flights.
- *Comfort and layovers - 10%*: Evaluates risk factors such as multi-airport transfers or overnight
stays.

Routes with serious visa conflicts will be rejected or marked as "avoid", even if they are cheaper. 
Routes with mild uncertainty will display warnings such as "transit visa may be required", 
"check airline baggage transfer", or "passport expiry risk".

== Secure Serverless API Integration

Flight booking APIs and payment APIs require private keys. These keys must never be stored in 
Vite frontend variables because browser code can be  inspected by users. Skyline therefore 
uses a backend proxy through Netlify Functions or a Node.js/Express server. The frontend calls 
endpoints such as `/api/flights/search`, `/api/flights/price`, `/api/flights/book`, `/api/visa/check`, 
and `/api/payments/create-intent`. The backend then calls Duffel, FlightAware, Stripe, 
and Supabase securely.

== Airport Search and Flight Path Visualization

The application needs reliable airport data for search and maps. I ingested the OurAirports dataset
directly into Supabase with airport names, IATA codes, ICAO codes, city, country, latitude, and 
longitude. When a route is displayed, the app can draw the path from the origin airport to each 
layover and then to the destination. Each stop can show visa or transit warnings directly on the 
map or route card. It was all done to allow the user to lookup airports offline with map visualizations.
An interactive leaflet mapping componenets in the frontend, rendering the full multi-leg flight path with
color-coded stopovers representing transit risk levels.

== Data Privacy and Sensitive Traveler Information
#image("privacy.jpg", width: 100%)
Skyline stores sensitive profile information such as passport country, nationality, visas, and 
travel history. I implemented strict Row Level Security (RLS) policies within Supabase, that
minimizes and masks sensitive stored data and avoid saving unnecessary full passport details unless
required. Allowing the user to access their own profiles, saved searches, and bookings.
Card payments are processed via stripe elements, ensuring that no details are stored or touches 
our applications database or backend functions.

== Handling Incomplete or Uncertain Travel Rules

Visa rules change frequently and can depend on many details, so I built the rule engine to fail safely. 
When a route involves an unmapped country pair or ambiguous transit policy, the system explicitly
marks the status as “Verification Required” and provides actionable guidance on what the traveler
should verify with official embassy portals before booking.This improves trust and makes the
recommendation logic transparent.

#hr


//+=================================================+
// 6. Suggested screenshots and visualizations
// +===============================================+
= Suggested Screenshots and Visualizations

//The final project documentation should include the following screenshots:
*Screenshots that demonstrate the userflow of using the application:*

- Home/search screen with origin, destination, dates
#image("home_page.jpg", width: 100%)


- Traveler profile screen showing saved passport country, residence country, and visas
#image("traveler_profile.jpg", width: 100%)
#image("traveler_profile_card.jpg", width: 100%)


- Route results screen showing recommended, warning, and avoid route cards.
#image("route_ticket_options.jpg", width: 100%)
#image("route_ticket_options1.jpg", width: 100%)


- Flight path map showing origin, layovers, destination.
#image("route_details.jpg", width: 100%)

- Booking/checkout screen using Stripe test mode and saving the booking to Supabase.
#image("checkout.jpg", width: 100%)
#image("checkout_card_entry.jpg", width: 100%)
#image("trip_detail_confirmation.jpg", width: 100%)
#image("trip_detail_confirmation_pdf.jpg", width: 100%)


- Admin/rules screen for managing visa and transit rules in the diploma demo.
#image("admin_visa_rules.jpg", width: 100%)

#hr


//+=================================================+
// 7. Code and Implementation Highlights
// +===============================================+
= Code and Implementation Highlights

== Netlify: Environment variables and API keys on netlify
```yaml
//Environment variables
DUFFEL_ACCESS_TOKEN=*******************************************************
SUPABASE_URL=****************************************
SUPABASE_SERVICE_ROLE_KEY=*************************************************
STRIPE_SECRET_KEY=*********************************************************
//usused
#KIWI_TEQUILA_API_KEY=
#FLIGHTAWARE_API_KEY=
OPENSKY_USERNAME=*********
OPENSKY_PASSWORD=**********
VITE_SUPABASE_URL=****************************************
VITE_SUPABASE_ANON_KEY=****************************************************
VITE_SUPABASE_PUBLISHABLE_KEY=**********************************************
VITE_STRIPE_PUBLISHABLE_KEY=***********************************************
```

== Netlify Backend and lib API
#import "@preview/dtree:0.1.1": dtree

#dtree(```
  /
  netlify
    functions
      _lib
        duffelClient.js
        http.js
        kiwiClient.js
        openskyAuth.js
        routeScoring.js
        sampleAirports.js
        supabaseAdmin.js
        visaRules.js
      aircraft-position.mjs
      airports-search.mjs
      book-flight.mjs
      create-payment-intent.mjs
      flights-cheapest-dates.mjs
      flights-price.mjs
      flights-search.mjs
      flight-status.mjs
      live-flights.mjs
      visa-check.mjs
```)


== Frontend Architecture - /SkyLine/src/pages - /Skyline/src/ui
#dtree(```
  /
  .netlify
  dist
  netlify
  src
    assets
      icon.svg
    components
      api
      travel
      ui
        //essential UI components
    pages
      AcceptTerms.jsx
      AdminAirports.jsx
      AdminVisaRules.jsx
      AuthCallback.jsx
      Checkout.jsx
      EditTravelProfile.jsx
      HelpCenter.jsx
      Home.jsx
      LiveMap.jsx
      Login.jsx
      MyTrips.jsx
      PrivacyPolicy.jsx
      Profile.jsx
      Register.jsx
      RouteDetails.jsx
      SearchDetails.jsx
      Settings.jsx
      TripDetails.jsx
  
```)

== Architecture Summary
#table(
  columns: 4,
  [*Backend Functions*],[*DB read*],[*DB write*],[*External API*],
  [airports-search],[airports],[-],[-],
  [flights-search],[airports, visa_rules, transit_rules],[-],[Duffel],
  [flights-cheapest-dates],[-],[-],[#strike("kiwi tequila")],
  [flight-status],[-],[-],[FlightAware],
  [aircraft-positions],[-],[-],[OpenSky],
  [live-flights],[-],[-],[OpenSky],
  [flights-price],[-],[-],[Duffel],
  [visa-check],[visa-rules],[-],[-],
  [create-payment-intent],[-],[-],[Stripe],
  [book-flight],[-],[trips],[Stripe,Duffel],
)


== Sample Code - Frontend/Backend/DB Interaction
=== Airport search
- Frontend -> src/pages/Home + src/components/api/flightClient.mjs + src/components/travel/AirportSearchBox.jsx
- Backend -> .netlify/function/airports-search.mjs
- Database -> supabase/Airports




On the frontend, we check the data of our active profile and see if they are valid; validation is
checked by passport country and visa strength.
//******************************************
// code
// ****************************************
Frontend request used by forms and searchboxes to find airport using city, airport name or IATA/ICAO code.
The main code that calls the backend is netlify/airports-search is:
```js
const data = await getJSON('airports-search', { q: query });
  return data.airports || [];
```




*Full snippet:*
```js
//src/components/api/flightClients.js
// /**
//  * Airport search — used by FlightSearchForm, AirportSearchBox, EditProfileModal.
//  * Backed by the OurAirports dataset (imported into Supabase).
//  *
//  * @param {string} query  free text — city, airport name, or IATA/ICAO code
//  * @returns {Promise<Airport[]>}
//  */
 export async function searchAirports(query) {
   if (!query || query.length < 2) return [];
   try {
     const data = await getJSON('airports-search', { q: query });
     return data.airports || [];
   } catch {
     return [];
   }
 }

```


```js
//Frontend
//src/pages/Home
const runSearch = async (searchData) => {
  setLoading(true);
  try {
      let formattedTravelerProfile = null;
      // Wrap profile loading in its own safe try/catch block
      // so a database auth/fetch issue won't crash the flight search
       try {
         const profileData = await loadUserProfile();
         if (profileData && profileData.travel_profiles) {
           const { travel_profiles, active_profile_id } = profileData;
           const currentProfile = travel_profiles.find(p => String(p.id) === String(active_profile_id));

           if (currentProfile) {
             setActiveProfile(currentProfile);
             formattedTravelerProfile = {
               passport_country: currentProfile.passport_country,
               visas: currentProfile.visas || []
             };
           }
         }
       } catch (profileErr) {
         console.error("Failed to load user profile context:", profileErr);
         // Continues execution with formattedTravelerProfile = null
       }
    }
}

```
//***************************************
// Backend
// **************************************

A proxy between the airport input, and database, then output the corresponding airport. A fail safe/
fallback sample airport in case our database fails to respond
```mjs
//Backend
//.netlify/function/airports-search.mjs

function toClientShape(row) {
  return {
    code: row.iata_code || row.icao_code || '',
    icao: row.icao_code,
    name: row.name,
    city: row.city,
    country: row.country,
    lat: row.latitude,
    lon: row.longitude,
    subType: row.type === 'large_airport' || row.type === 'medium_airport' ? 'AIRPORT' : 'CITY',
  };
}


try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('airports')
      .select('iata_code, icao_code, name, city, country, latitude, longitude, type')
      .or(
        [
          `iata_code.ilike.%${query}%`,
          `icao_code.ilike.%${query}%`,
          `city.ilike.%${query}%`,
          `name.ilike.%${query}%`,
        ].join(',')
      )
      .order('city', { ascending: true })
      .limit(15);

    if (error) throw error;

    const withIata = (data || []).filter((row) => row.iata_code);
    const icaoOnly = (data || []).filter((row) => !row.iata_code);
    const combined = [...withIata, ...icaoOnly];

    if (combined.length > 0) {
      return ok({ airports: combined.map(toClientShape), source: 'supabase' });
    }
    //fail safe
    const fallback = searchSampleAirports(query).map(toClientShape);
    return ok({ airports: fallback, source: 'fallback' });
  } catch (err) {
    console.error('airports-search error:', err);
    
    const fallback = searchSampleAirports(query).map(toClientShape);
    return ok({ airports: fallback, source: 'fallback', warning: err.message });
  }
};
```

*Database response:*
```bash
{ "airports": [
    { "code": "DOH", "icao": "OTHH", "name": "Hamad International Airport", "city": "Doha", "country": "QA", "lat": 25.27, "lon": 51.61, "subType": "AIRPORT" }
    ], "source": "supabase" }
]}
```
*Airport Dataset*
#image("airports_data.jpg", width:80%)



=== Search flights + Flight pricing + Create Payment Intent
- Frontend -> src/pages/Home.js + src/components/api/flightClient.js
- Backend -> netlify/flights-search.mjs + netlify/flights-price.mjs + netlify/lib/duffelClient.js 
- Database -> Airports, visa_rules, transit_rules

The part that calls the netlify backend flights-search:
```js
const data = await postJSON('flights-search', {
  origin: originCode,
  destination: destinationCode,
  departureDate,
  returnDate: returnDate || null,
  travelerProfile: travelerProfile || null,
});
return data.offers || [];
```


*Full snippet:*


```jsx
//src/components/api/flightClient.js
/**
  * Flight search — used by Home.jsx after FlightSearchForm submits.
  * Routed through Duffel, annotated with visa risk, and ranked using the
  * documented price/duration/comfort/visa weighting model.
  *
  * @param {FlightSearchParams} [params]
  * @returns {Promise<Array<Object>>} ranked route offers
  */
 export async function searchFlights({ origin, destination, departureDate, returnDate, travelerProfile } = {}) {
   const originCode = typeof origin === 'string' ? origin : origin?.code;
   const destinationCode = typeof destination === 'string' ? destination : destination?.code;

   try {
     const data = await postJSON('flights-search', {
       origin: originCode,
       destination: destinationCode,
       departureDate,
       returnDate: returnDate || null,
       travelerProfile: travelerProfile || null,
     });
     return data.offers || [];
   } catch (err) {
     if (import.meta.env.DEV) {
       // @ts-ignore
       console.warn('searchFlights falling back to mock data:', err.message);
       return generateMockOffers(
         {
           origin: typeof origin === 'string' ? { code: origin } : origin,
           destination: typeof destination === 'string' ? { code: destination } : destination,
           departureDate,
         },
         travelerProfile
       );
     }
     throw err;
   }
 }
```


```jsx
//searching frontend
//Pass payload safely into searchFlights
      const offers = await searchFlights({
        origin: searchData.origin,
        destination: searchData.destination,
        departureDate: searchData.departureDate,
        returnDate: searchData.returnDate,
        travelerProfile: formattedTravelerProfile, 
      });
      
      setRoutes(offers || []);
      saveSearchResults(offers || []);

      const fromDate = formatDate(addDays(new Date(searchData.departureDate), -15), 'yyyy-MM-dd');
      const toDate = formatDate(addDays(new Date(searchData.departureDate), 15), 'yyyy-MM-dd');
      const prices = await getCheapestDates({
        origin: searchData.origin.code,
        destination: searchData.destination.code,
        fromDate,
        toDate,
      });
      setCalendarPrices(Object.keys(prices).length ? prices : null);
    } catch (err) {
      console.error("Flight search endpoint error:", err);
      toast.error(err.message || 'Search failed');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoute = (route) => {
    saveSelectedRoute(route);
    navigate(createPageUrl('RouteDetails'));
  };

  const handleCalendarDateSelect = async (date) => {
    const next = { ...search, departureDate: formatDate(date, 'yyyy-MM-dd') };
    await runSearch(next);
    setViewMode('list');
  };

  if (!search) return null;


const filtered = filterRoutes(routes, filter);
```


*Database response is to read the* _airports_, _visa_rules_, and _transit_rules_ *tables via visaRules.js
then annotate each Duffel offer, returning json response:*

```json
offers": [
    { "id": "off_123", "price": 300, "hasVisaIssue": false, "isRecommended": true, "score": 92, "destVisaStatus": "visa_free" }
    ] }
]
```


*User flow moves towards showing a list of flights, prices, and offers:*
Frontend call _priceOffer.js:_
```js
/**
 * Price a previously-searched offer and lock it for booking.
 * Maps to Duffel's offer-price step before order creation.
 *
 * @param {string} offerId
 * @returns {Promise<Object>}
 */
export async function priceOffer(offerId) {
  try {
    return await postJSON('flights-price', { offerId });
  } catch (err) {
    if (import.meta.env.DEV) {
      const route = JSON.parse(sessionStorage.getItem('skyline_selected_route') || 'null');
      return {
        offerId,
        totalAmount: route?.price || 450,
        currency: route?.currency || 'USD',
        available: true,
      };
    }
    throw err;
  }
}
```

*Order and response Information in Duffel:*
#image("duffel_order.jpg", width: 100%)


=== Create Payment Intent
- Frontend -> src/pages/Checkout.jsx + src/component/api/flightClient.js
- Backend -> netlify/functions/create-payment-intent.mjs + stripe API
- Database -> No write/read

```js
src/components/api/flightClient.js
export async function createPaymentIntent({ offerId, amount, currency }) {
  try {
    return await postJSON('create-payment-intent', { offerId, amount, currency });
  } catch (err) {
    if (import.meta.env.DEV) {
      throw new Error('Stripe not available in dev without Netlify — run `netlify dev` or use demo checkout.');
    }
    throw err;
  }
}
```
*handling payment intent:*
```mjs
netlify/functions/create-payment-intent.mjs
const { offerId, amount, currency } = parseBody(event);
  if (!offerId || !amount || !currency) {
    return badRequest('offerId, amount, and currency are required.');
  }

  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      metadata: { offerId },
      automatic_payment_methods: { enabled: true },
    });
```

*Stripe Payment Intent and response:*
```json
{ "clientSecret": "pi_123_secret_abc", "paymentIntentId": "pi_123" }
```

```bash
Request from ::1: POST /.netlify/functions/flights-price
Response with status 200 in 338 ms.
Request from ::1: POST /.netlify/functions/create-payment-intent
Response with status 200 in 1002 ms.

```

//#image("stripe_payment_intent.png", width:100%)



=== Book Flight
- Frontend -> src/pages/TripsDetails.jsx + src/pages/MyTrips.jsx
- Backend/Router -> netlify/functions/book-flight.mjs + src/components/api/flightClient.js
- Database -> Insert into _trips_ table

*Snippet that bridges/communicates with the _book-flight_ backend:*
```js
//src/components/api/flightClient.js

/**
 * Create a booking/order. Maps to Duffel order creation. Should be called
 * only after a successful Stripe PaymentIntent confirmation.
 *
 * @param {Object} params
 * @param {string} params.offerId
 * @param {Array<Object>} params.passengers
 * @param {string} params.paymentIntentId
 * @param {string} [params.userId]
 * @returns {Promise<Object>} booking record (also persisted to Supabase)
 */
export async function createBooking({ offerId, passengers, paymentIntentId, userId }) {
  try {
    return await postJSON('book-flight', { offerId, passengers, paymentIntentId, userId });
  } catch (err) {
    if (import.meta.env.DEV) {
      return { bookingReference: `SKY-${Date.now().toString(36).toUpperCase()}`, orderId: offerId };
    }
    throw err;
  }
}
```

*Backend that communicates with stripe, duffel, and then plot the information into our _trips_ table:*
- Confirmation with stripe:
```mjs
//netlify/functions/book-flight.mjs

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.');
  return new Stripe(key);
}


// 1. Confirm payment actually succeeded before issuing the ticket.
const stripe = getStripe();
const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
if (paymentIntent.status !== 'succeeded') {
  return badRequest(`Payment has not completed (status: ${paymentIntent.status}).`);
}
```

- Use our passenger information and create an order on duffel - which will help with printing out the iternary
information.
```mjs
const orderResult = await createOrder({ offerId, passengers: formattedPassengers });
    const order = orderResult?.data;

    if (!order) {
      return serverError('Failed to retrieve order data from Duffel.');
    }
```

- Retrieve the information from duffel(flight information, passenger information, etc.) and place them into
our database - which will help when placing information in our frontend(MyTrips, TripDetails).

```mjs

const supabase = getSupabaseAdmin();
    const tripRecord = {
      booking_reference: order.booking_reference,
      duffel_order_id: order.id,
      user_id: userId || null,
      status: 'upcoming',
      origin: order.slices[0]?.segments[0]?.origin,
      destination: order.slices[order.slices.length - 1]?.segments?.slice(-1)[0]?.destination,
      departure_date: order.slices[0]?.segments[0]?.departing_at,
      arrival_date: order.slices[order.slices.length - 1]?.segments?.slice(-1)[0]?.arriving_at,
      price: parseFloat(order.total_amount),
      currency: order.total_currency,
      payment_intent_id: paymentIntentId,
      passengers: formattedPassengers,
      segments: order.slices.flatMap((slice) => slice.segments),
      created_at: new Date().toISOString(),
    };

    const { data: savedTrip, error: insertError } = await supabase
      .from('trips')
      .insert(tripRecord)
      .select()
      .single();

    if (insertError) {
      // Booking with the airline already succeeded — don't fail the
      // whole request just because the local record failed to save.
      console.error('Failed to persist booking to Supabase:', insertError);
    }

    return ok({
      bookingReference: order.booking_reference,
      orderId: order.id,
      trip: savedTrip || tripRecord,
    });
  } catch (err) {//book flight fail
    console.error('book-flight error:', err);
    return serverError(err.message || 'Booking failed.');
  }
};
```


*Database response: verify Stripe paymentintent, call Duffels order-create endpoint, then INSERT into
the _trips_ table:*
- Exemplary response from duffel:
```bash
{ "bookingReference": "FBKDU4", "orderId": "ord_456", "trip": { "id": 17, "user_id": "uuid-...", "price": 300, "currency": "USD" } }
```
- Skyline _trips_ database:
```sql
{"idx":0,"id":1,"user_id":"d6230797-e889-42a1-9dfb-14a4b67f10ca","booking_reference":"OVIHJA",  \
"duffel_order_id":"ord_0000B8YSdCRhfs91nQQn04","status":"upcoming","origin":"   \
{\"iata_city_code\":\"DOH\",    \
"city_name\":\"Doha\",\"iata_country_code\":\"QA\",\"icao_code\":\"OTHH\",\"iata_code\":\"DOH\",  \
\"latitude\":25.260642,\"longitude\":51.615118,\"city\":null,\"time_zone\":\"Asia/Qatar\",\   \
"type\":\"airport\",\"name\":\"Hamad International Airport\",\"id\":\"arp_doh_qa\"}",       \
"destination":"{\"iata_city_code\":\"WAW\",\"city_name\":\"Warsaw\",\"iata_country_code\":    \
\"PL\",\"icao_code\":\"EPWA\",\"iata_code\":\"WAW\",\"latitude\":52.166211,\"longitude\":20.967363,   \
\"city\":null,\"time_zone\":\"Europe/Warsaw\",\"type\":\"airport\",\"name\":\"Warsaw Chopin Airport\",  \
\"id\":\"arp_waw_pl\"}","departure_date":"2026-07-29 21:40:00+00","arrival_date":"2026-07-30 02:30:00+00",   \
"price":"169.65","currency":"GBP","payment_intent_id":"pi_3TvYid6ISHie8VVg1dGkbk8h",  \
```

*Results on duffel:*
#image("airports_duffel.jpg", width:100%);
#hr




//+=================================================+
// 8. Conclusions and development prospects
// +===============================================+
= Conclusions and Development Prospects

SkyLine addresses a practical problem that is not fully solved by ordinary flight search engines.
Many travelers cannot choose flights based only on price because their passport strength, residence
status, and visas affect which destinations and transit routes are possible. The project demonstrates
how flight APIs, airport data, user profiles, and visa/transit rules are be combined into a
recommendation system that provides safer and more useful travel planning


The current version uses a controlled visa rule dataset and API sandbox environments. Future development could include integration with IATA Timatic or Sherpa for professional travel documentation
checks, wider booking inventory through Sabre or Travelport, automatic passport document scanning,
multilingual support, mobile applications, route risk learning based on user feedback, and stronger
admin tools for maintaining visa rules.

*Github:* https://github.com/Otu-EkongEffiong/SkyLine \
*Website:* gilded-rugelach-aa6f62.netlify.app



#hr






//+=================================================+
// 9. Bibliography and sources
// +===============================================+
= Bibliography and Sources

- Duffel API Documentation: #link("https://duffel.com/docs/api/overview/welcome") (Accessed: 14.07.2026)
- Kiwi.com Tequila API Documentation: #link("https://tequila.kiwi.com/portal/docs/tequila_api") (Accessed: 22.06.2026)
- FlightAware AeroAPI Documentation: #link("https://www.flightaware.com/aeroapi/portal/documentation") (Accessed: 05.08.2026)
- OpenSky Network REST API: #link("https://openskynetwork.github.io/opensky-api/rest.html") (Accessed: 11.07.2026)
- OurAirports Data: #link("https://ourairports.com/data/") (Accessed: 29.08.2026)
- Supabase Documentation: #link("https://supabase.com/docs") (Accessed: 19.06.2026)
- Stripe API Documentation: #link("https://docs.stripe.com/api") (Accessed: 02.09.2026)
- Netlify Functions Documentation: #link("https://docs.netlify.com/build/functions/overview/") (Accessed: 15.08.2026)
- IATA Timatic: #link("https://www.iata.org/en/services/compliance/timatic/") (Accessed: 08.06.2026)
- Sherpa: #link("https://www.joinsherpa.com/") (Accessed: 27.07.2026)
- Passport Index: #link("https://www.passportindex.org/") (Accessed: 04.09.2026)
- Henley Passport Index: #link("https://www.henleyglobal.com/passport-index") (Accessed: 13.08.2026)
