import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../components';

const Root = () => {
  const { isUserLogged } = useContext(UserContext);
  if (isUserLogged) {
    return 'logged in';
  }

  return (
    <main>
      <Outlet />
    </main>
  );
};

export default Root;
