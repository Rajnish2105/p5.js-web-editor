import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const getPageTitle = (pageName, t) => {
  switch (pageName) {
    case 'login':
      return t('LoginView.Login');
    case 'signup':
      return t('LoginView.SignUp');
    case 'account':
      return t('AccountView.Settings');
    case 'examples':
      return t('Nav.File.Examples');
    case 'myStuff':
      return 'My Stuff';
    case 'home':
    default:
      return null; // Will use project.name as fallback in Nav
  }
};

/**
 * @returns {{ page: "home" | "myStuff" | "login" | "signup" | "account" | "examples", title: string }}
 */
const useWhatPage = () => {
  const username = useSelector((state) => state.user.username);
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const pageName = useMemo(() => {
    const myStuffPattern = new RegExp(
      `(/${username}/(sketches/?$|collections|assets)/?)`
    );

    if (myStuffPattern.test(pathname)) return 'myStuff';
    else if (pathname === '/login') return 'login';
    else if (pathname === '/signup') return 'signup';
    else if (pathname === '/account') return 'account';
    else if (pathname === '/p5/collections' || pathname === '/p5/sketches')
      return 'examples';
    return 'home';
  }, [pathname, username]);

  const title = useMemo(() => getPageTitle(pageName, t), [pageName, t]);

  // For backwards compatibility
  const returnValue = {
    pageName,
    title
  };

  // Add a console warning in development
  if (process.env.NODE_ENV === 'development') {
    // Make the object look like a string for old code
    Object.defineProperty(returnValue, 'toString', {
      value: () => {
        console.warn(
          'Deprecated: useWhatPage() now returns an object. Please update your code to use { page, title }.'
        );
        return pageName;
      }
    });
  }

  return returnValue;
};

export default useWhatPage;
