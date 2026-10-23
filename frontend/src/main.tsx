import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminDashboard } from './components/AdminDashboard.tsx'
import { ProjectDetailPage } from './pages/ProjectDetailPage.tsx'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.tsx'
import { TermsOfServicePage } from './pages/TermsOfServicePage.tsx'
import { RERACompliancePage } from './pages/RERACompliancePage.tsx'
import { ContactUsPage } from './pages/ContactUsPage.tsx'
import { Chatbot } from './components/Chatbot.tsx'
import { UserProvider } from './contexts/UserContext.tsx'

function AppRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (currentPath === '/admin') {
    return <AdminDashboard />;
  }

  let pageContent;
  if (currentPath === '/privacy-policy') {
    pageContent = <PrivacyPolicyPage />;
  } else if (currentPath === '/terms-of-service') {
    pageContent = <TermsOfServicePage />;
  } else if (currentPath === '/rera-compliance') {
    pageContent = <RERACompliancePage />;
  } else if (currentPath === '/contact-us') {
    pageContent = <ContactUsPage />;
  } else if (currentPath.startsWith('/project/') || currentPath.startsWith('/projects/')) {
    const identifier = currentPath.replace(/^\/projects?\//, '').split('?')[0].split('#')[0];
    pageContent = <ProjectDetailPage identifier={identifier} />;
  } else {
    pageContent = <App />;
  }

  return (
    <UserProvider>
      {pageContent}
      <Chatbot />
    </UserProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
