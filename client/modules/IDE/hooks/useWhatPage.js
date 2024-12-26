import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

/**
 *
 * @returns {"home" | "myStuff" | "login" | "signup" | "account" | "examples"}
 */
const useWhatPage = () => {
  const username = useSelector((state) => state.user.username);
  const project = useSelector((state) => state.project);
  const { pathname } = useLocation();

  const pageName = useMemo(() => {
    const myStuffPattern = new RegExp(
      `(/${username}/(sketches/?$|collections|assets)/?)`
    );

    if (myStuffPattern.test(pathname)) return 'My Stuff';
    else if (pathname === '/login') return 'LoginView.Login';
    else if (pathname === '/signup') return 'LoginView.SignUp';
    else if (pathname === '/account') return 'AccountView.Settings';
    else if (pathname === '/p5/collections' || pathname === '/p5/sketches')
      return 'Nav.File.Examples';
    return project.name || 'home';
  }, [pathname, username]);

  return pageName;
};

export default useWhatPage;
