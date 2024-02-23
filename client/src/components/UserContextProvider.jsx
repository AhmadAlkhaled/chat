import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext({});

export const getCookie = (cookieName) => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${cookieName}=`)) {
      return cookie.substring(cookieName.length + 1);
    }
  }
  return null;
};

export const UserContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLogged, setIsLogged] = useState(() => {
    const savedIsLogged = localStorage.getItem('isLogged');
    return savedIsLogged ? JSON.parse(savedIsLogged) : false;
  });
  const [isVisible, setIsVisible] = useState(false);
  const [mobileVision, setMobileVision] = useState(false);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [userImg, setUserImg] = useState('');


  useEffect(() => {
    const token = getCookie('token');

    if (token) {
      const decodedToken = jwtDecode(token);
      setCurrentUser(decodedToken);
      setUserId(decodedToken.userId);
      setFirstName(decodedToken.firstName);
      setLastName(decodedToken.lastName);
    }

    const handleResize = () => {
      if (window.innerWidth < 992) {
        setMobileVision(true);
      } else {
        setMobileVision(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        email,
        setEmail,
        password,
        setPassword,
        userId,
        setUserId,
        isLogged,
        setIsLogged,
        isVisible,
        setIsVisible,
        mobileVision,
        friends,
        setFriends,
        messages,
        setMessages,
        onlineUsers,
        setOnlineUsers,
        socket,
        setSocket,
        userImg,
        setUserImg,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
