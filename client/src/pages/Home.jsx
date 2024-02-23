import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo1.svg';
import chatIcon from '../assets/images/undraw_mobile_encryption_re_yw3o.svg';
import axios from 'axios';
import { useEffect } from 'react';
import { getCookie } from '../components/UserContextProvider';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      axios
        .post('/check-web-token', { token: token })
        .then((response) => {
          const { data } = response;
          if (data.status) {
            navigate('/chat-page');
          } else {
            navigate('/');
          }
        })
        .catch((error) => {
          console.error('Error occurred:', error);
        });
    }
  }, []);

  return (
    <section className='h-screen w-full bg-gradient-to-bl from-bgGradientFrom to-bgGradientTo'>
      <nav className='h-14 w-full flex justify-between items-center px-2 md:px-10 xl:px-56 shadow-md relative'>
        <div className='w-24 xl:w-44 h-14'>
          <img src={logo} alt='logo' className='w-full h-full object-cover' />
        </div>
        <Link
          to='/log-in'
          className='px-1 rounded-md font-bold border text-textDark bg-textWhite hover:bg-textGreen delay-75 duration-500'
        >
          LogIn
        </Link>
      </nav>

      <div className='h-[calc(100%-56px)] flex justify-center items-center md:px-10 xl:px-20'>
        <div className='h-[550px] w-full flex flex-col justify-center items-center gap-10 p-5 lg:w-full xl:flex-row xxl:gap-48'>
          <div className='flex flex-col justify-start gap-4 text-textWhite xs:self-start sm:ml-8 md:ml-20 xl:self-center xxl:gap-10'>
            <p className='text-2xl font-bold capitalize w-fit lg:text-4xl xxl:text-6xl'>
              Chatting privately
            </p>
            <p className='text-sm font-bold text-justify md:w-[500px] xs:w-96 lg:text-lg xxl:text-xl'>
              Sending private messages reliably and easily from anywhere in the
              world .
            </p>
            <button className='w-fit px-5 py-1 rounded-md bg-textGreen text-textDark font-bold hover:bg-textWhite delay-75 duration-500'>
              <Link to='/sign-up'>Register</Link>
            </button>
          </div>
          <img
            src={chatIcon}
            alt='hero-image'
            className='w-4/6 xs:w-80 xl:w-96 xxl:w-[500px] xs:self-end sm:mr-8 md:mr-20 xl:self-center'
          />
        </div>
      </div>
    </section>
  );
};

export default Home;
