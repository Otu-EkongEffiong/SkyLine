import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { TabNavigationProvider } from '@/lib/TabNavigationContext';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <TabNavigationProvider>
            <NavigationTracker />
            <AuthenticatedApp />
          </TabNavigationProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App


// // @ts-nocheck
// import { Toaster } from "@/components/ui/toaster"
// import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Layout from '@/Layout.jsx';

// // ── Page imports ──────────────────────────────────────────────────────────
// import Home from '@/pages/Home';
// import Profile from '@/pages/Profile';
// import MyTrips from '@/pages/MyTrips';
// import Settings from '@/pages/Settings';
// import HelpCenter from '@/pages/HelpCenter';

// const queryClient = new QueryClient({
//   defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } }
// });

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <Router>
//         <Layout>
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/Home" element={<Home />} />
//             <Route path="/Profile" element={<Profile />} />
//             <Route path="/MyTrips" element={<MyTrips />} />
//             <Route path="/Settings" element={<Settings />} />
//             <Route path="/HelpCenter" element={<HelpCenter />} />
//             <Route path="*" element={<Home />} />
//           </Routes>
//         </Layout>
//         <Toaster />
//       </Router>
//     </QueryClientProvider>
//   );
// }

// export default App;