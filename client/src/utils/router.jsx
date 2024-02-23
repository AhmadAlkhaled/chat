import { createBrowserRouter } from 'react-router-dom';
import { Root } from '../components';
import { LogIn, PageNotFound, SignUp, Profile, ChatPage, Home } from '../pages';

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/sign-up', element: <SignUp /> },
      { path: '/log-in', element: <LogIn /> },
      { path: '/profile', element: <Profile /> },
      { path: '/chat-page', element: <ChatPage /> },
      {
        path: '*',
        element: <PageNotFound />,
      },
    ],
  },
]);

export default router;
