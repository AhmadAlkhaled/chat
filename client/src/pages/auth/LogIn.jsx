import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../components';
import logo from '../../assets/images/logo1.svg';

const LogIn = () => {
  const { email, setEmail, password, setPassword, setCurrentUser } =
    useContext(UserContext);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthTrue, setIsAuthTrue] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post('/log-in', {
        email,
        password,
      })
      .then((data) => {
        if (data.data.message === 'your logged in') {
          document.cookie = data.data.token
          setLoading(false);
          navigate('/chat-page');
        } else if (
          data.data === 'user not found' ||
          data.data === 'Invalid credentials'
        ) {
          setIsAuthTrue(true);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const handleCallbackResponse = (response) => {
    const googleUserData = response.credential;
    const decodeGoogleUserData = jwtDecode(googleUserData);

    axios
      .post('/log-in-google', decodeGoogleUserData)
      .then((data) => {
        if (data.data.message === 'your logged in') {
          navigate('/chat-page');
        } else if (data.data === 'user not found') {
          setIsAuthTrue(true);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  return (
    <section className='min-h-screen flex flex-col justify-center items-center bg-bgDark'>
      <div className='w-48 xl:w-56'>
        <Link to='/'>
          <img src={logo} alt='logo' className='w-full h-full object-cover' />
        </Link>
      </div>

      <form
        className='w-5/6 md:w-3/6 xl:w-2/6 mx-auto bg-bgLight text-textWhite shadow-md shadow-stone-950/50 py-10 px-5 rounded-xl'
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor='LoginEmail'>Email</label>
          <input
            className={`block w-full rounded-md border-2 p-2 mb-3 text-textDark ${
              isAuthTrue && 'border-[#ff5a5a]'
            } `}
            type='email'
            id='LoginEmail'
            name='LoginEmail'
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className='relative'>
          <label htmlFor='loginPassword'>Password</label>
          <input
            className={`block w-full rounded-md border-2 p-2 mb-3 pr-9 text-textDark ${
              isAuthTrue && 'border-[#ff5a5a]'
            }`}
            type={showPassword ? 'text' : 'password'}
            id='loginPassword'
            name='loginPassword'
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          {showPassword ? (
            <i
              className='fa-solid fa-eye-slash absolute right-3 top-9 cursor-pointer text-textDark'
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          ) : (
            <i
              className='fa-solid fa-eye absolute right-3 top-9 cursor-pointer text-textDark'
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          )}
        </div>
        {isAuthTrue && (
          <p className='text-[#ff5a5a] mb-3'>
            The Email or Password entered is incorrect.
          </p>
        )}

        {loading ? (
          <button
            disabled
            className='font-bold bg-textGreen text-textWhite w-full p-2 mb-3 rounded-md flex justify-center items-center cursor-wait'
          >
            <svg
              aria-hidden='true'
              role='status'
              className='inline w-4 h-4 me-3 text-white animate-spin'
              viewBox='0 0 100 101'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                fill='#E5E7EB'
              />
              <path
                d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                fill='currentColor'
              />
            </svg>
            Loading...
          </button>
        ) : (
          <button
            className='font-bold bg-textGreen transition-colors delay-75 duration-500 text-textWhite w-full p-2 mb-3 rounded-md flex justify-center items-center hover:bg-darkGreen '
            type='submit'
          >
            Log In
          </button>
        )}

        <div className='flex w-full justify-center'>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                handleCallbackResponse(credentialResponse);
              }}
              onError={(errorResponse) => {
                console.log(errorResponse);
                console.log('Login Failed');
              }}
              logo_alignment='center'
              width={250}
            />
          </GoogleOAuthProvider>
        </div>

        <p className='mt-2'>
          Don't have an account ?
          <Link
            to='/sign-up'
            className='text-textGreen ml-2 hover:text-darkGreen'
          >
            Register
          </Link>
        </p>
      </form>
    </section>
  );
};

export default LogIn;
