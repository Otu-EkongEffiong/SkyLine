/**
 * pages.config.jsx — lazy-loaded page routing configuration
 */
import React, { Suspense } from 'react';
import __Layout from './Layout.jsx';

const AcceptTerms       = React.lazy(() => import('./pages/AcceptTerms'));
const AdminAirports     = React.lazy(() => import('./pages/AdminAirports'));
const AdminVisaRules    = React.lazy(() => import('./pages/AdminVisaRules'));
const Checkout          = React.lazy(() => import('./pages/Checkout'));
const EditTravelProfile = React.lazy(() => import('./pages/EditTravelProfile'));
const HelpCenter        = React.lazy(() => import('./pages/HelpCenter'));
const Home              = React.lazy(() => import('./pages/Home'));
const LiveMap           = React.lazy(() => import('./pages/LiveMap'));
const Login             = React.lazy(() => import('./pages/Login'));
const MyTrips           = React.lazy(() => import('./pages/MyTrips'));
const PrivacyPolicy     = React.lazy(() => import('./pages/PrivacyPolicy'));
const Profile           = React.lazy(() => import('./pages/Profile'));
const Register          = React.lazy(() => import('./pages/Register'));
const RouteDetails      = React.lazy(() => import('./pages/RouteDetails'));
const SearchResults     = React.lazy(() => import('./pages/SearchResults'));
const Settings          = React.lazy(() => import('./pages/Settings'));
const TripDetails       = React.lazy(() => import('./pages/TripDetails'));

const PageFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
  </div>
);

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
  AdminVisaRules:    withSuspense(AdminVisaRules),
  Checkout:          withSuspense(Checkout),
  EditTravelProfile: withSuspense(EditTravelProfile),
  HelpCenter:        withSuspense(HelpCenter),
  Home:              withSuspense(Home),
  LiveMap:           withSuspense(LiveMap),
  Login:             withSuspense(Login),
  MyTrips:           withSuspense(MyTrips),
  PrivacyPolicy:     withSuspense(PrivacyPolicy),
  Profile:           withSuspense(Profile),
  Register:          withSuspense(Register),
  RouteDetails:      withSuspense(RouteDetails),
  SearchResults:     withSuspense(SearchResults),
  Settings:          withSuspense(Settings),
  TripDetails:       withSuspense(TripDetails),
};

export const pagesConfig = {
  mainPage: 'Home',
  Pages: PAGES,
  Layout: __Layout,
};
