/**
 * pages.config.jsx — lazy-loaded page routing configuration
 * Uses React.lazy for route-based code splitting.
 */
import React, { Suspense } from 'react';
import __Layout from './Layout.jsx';

// ── Lazy page imports ──────────────────────────────────────────────────────────
const AcceptTerms       = React.lazy(() => import('./pages/AcceptTerms'));
const AdminAirports     = React.lazy(() => import('./pages/AdminAirports'));
const EditTravelProfile = React.lazy(() => import('./pages/EditTravelProfile'));
const HelpCenter        = React.lazy(() => import('./pages/HelpCenter'));
const Home              = React.lazy(() => import('./pages/Home'));
const MyTrips           = React.lazy(() => import('./pages/MyTrips'));
const PrivacyPolicy     = React.lazy(() => import('./pages/PrivacyPolicy'));
const Profile           = React.lazy(() => import('./pages/Profile'));
const Settings          = React.lazy(() => import('./pages/Settings'));
const TripDetails       = React.lazy(() => import('./pages/TripDetails'));

// Minimal fallback — inherits bg so there's no flash
const PageFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
  </div>
);

// Wrap every lazy page in Suspense
function withSuspense(Component) {
  return function SuspenseWrapper(props) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

export const PAGES = {
  AcceptTerms:       withSuspense(AcceptTerms),
  AdminAirports:     withSuspense(AdminAirports),
  EditTravelProfile: withSuspense(EditTravelProfile),
  HelpCenter:        withSuspense(HelpCenter),
  Home:              withSuspense(Home),
  MyTrips:           withSuspense(MyTrips),
  PrivacyPolicy:     withSuspense(PrivacyPolicy),
  Profile:           withSuspense(Profile),
  Settings:          withSuspense(Settings),
  TripDetails:       withSuspense(TripDetails),
};

export const pagesConfig = {
  mainPage: 'Home',
  Pages: PAGES,
  Layout: __Layout,
};