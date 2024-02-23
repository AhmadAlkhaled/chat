import axios from 'axios';
import { useContext } from 'react';
import { UserContext } from '../../components';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo1.svg';

const SignUp = () => {
  const navigate = useNavigate();

  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
  } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await axios.post('/sign-up', {
      firstName,
      lastName,
      email,
      password,
    });

    console.log(data);
    if (data.message === 'your are successfully registered') {
      alert(' your are successfully registered ');
      navigate('/log-in');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <section className='min-h-screen flex flex-col justify-center items-center bg-bgDark '>
      <div className='w-48 xl:w-56'>
        <Link to='/'>
          <img src={logo} alt='logo' className='w-full h-full object-cover' />
        </Link>
      </div>

      <form
        className='w-5/6 md:w-3/6 xl:w-2/6 mx-auto bg-bgLight text-textWhite shadow-md shadow-stone-950/50 py-10 px-5 rounded-xl '
        onSubmit={handleSubmit}
      >
        {['firstName', 'lastName', 'email', 'password'].map((field) => (
          <div key={field}>
            <label htmlFor={field}>
              {field[0].toUpperCase() + field.slice(1)}
            </label>

            <input
              className='block w-full text-textDark rounded-md border-2 border-borderPrimary p-2 mb-3'
              type={
                field === 'password'
                  ? 'password'
                  : field === 'email'
                  ? 'email'
                  : 'text'
              }
              required
              id={field}
              name={field}
              value={
                field === 'firstName'
                  ? firstName
                  : field === 'lastName'
                  ? lastName
                  : field === 'email'
                  ? email
                  : password
              }
              onChange={(e) =>
                field === 'firstName'
                  ? setFirstName(e.target.value)
                  : field === 'lastName'
                  ? setLastName(e.target.value)
                  : field === 'email'
                  ? setEmail(e.target.value)
                  : setPassword(e.target.value)
              }
            />
          </div>
        ))}

        <button
          className='bg-textGreen font-bold hover:bg-darkGreen transition-colors delay-75 duration-500 text-textWhite block w-full rounded-md p-2 mb-3'
          type='submit'
        >
          Register
        </button>

        <p className='mt-2'>
          Already have an account ?
          <Link
            to='/log-in'
            className='text-textGreen hover:text-darkGreen ml-2'
          >
            Log In
          </Link>
        </p>
      </form>
    </section>
  );
};

export default SignUp;
