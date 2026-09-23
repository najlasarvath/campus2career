import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PortalContext = createContext(null);

export function PortalProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current portal based on pathname
  const getPortalFromPath = (path) => {
    if (path.startsWith('/college')) return 'college';
    if (path.startsWith('/company')) return 'company';
    return 'student'; // default to student for /, /role-match, /roadmap, /resources, /interview, /student/*
  };

  const [activePortal, setActivePortal] = useState(() => getPortalFromPath(location.pathname));

  // Sync active portal when URL changes
  useEffect(() => {
    const portal = getPortalFromPath(location.pathname);
    setActivePortal(portal);
  }, [location.pathname]);

  const switchPortal = (portalKey) => {
    setActivePortal(portalKey);
    if (portalKey === 'student') {
      navigate('/student');
    } else if (portalKey === 'college') {
      navigate('/college/dashboard');
    } else if (portalKey === 'company') {
      navigate('/company/requirements');
    }
  };

  return (
    <PortalContext.Provider value={{ activePortal, switchPortal }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
