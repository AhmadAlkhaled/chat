import { useContext } from 'react';
import { UserContext } from './UserContextProvider';
import chatLogo from '../assets/images/logo1.svg';

const DefaultChatContainer = () => {
  const { isVisible, mobileVision } = useContext(UserContext);

  return (
    <div
      className={` w-[70%] flex justify-center items-center bg-bgDark ${
        isVisible || mobileVision ? 'hidden' : 'block'
      }`}
    >
      <img src={chatLogo} alt='chat logo' className='w-[500px]' />
    </div>
  );
};

export default DefaultChatContainer;
