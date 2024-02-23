import { useContext, useEffect } from 'react';
import { UserContext } from './UserContextProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CheckAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = window.document.cookie.split('=');

    if (token.length !== 2 || token[0] !== 'token') {
      localStorage.setItem('isLogged', JSON.stringify(false));
      navigate('/log-in');
    } else {
      axios
        .post('/check-web-token', { key: token[0], value: token[1] })
        .then((response) => {
          const { data } = response;
          if (data.status) {
            localStorage.setItem('isLogged', JSON.stringify(true));
          } else {
            localStorage.setItem('isLogged', JSON.stringify(false));
            alert(data.message);
            document.cookie =
              'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          }
          navigate('/log-in');
        })
        .catch((error) => {
          console.error('Error occurred:', error);
          localStorage.setItem('isLogged', JSON.stringify(false));
        });
    }
  }, []);
};

export default CheckAuth;
