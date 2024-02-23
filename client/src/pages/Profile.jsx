import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../components';
import axios from 'axios';
import { getCookie } from '../components/UserContextProvider';
import avatar from '../assets/images/img_avatar.png';
import Avatar from 'react-avatar-edit';
import { motion } from 'framer-motion';

const Profile = () => {
  const {
    isLogged,
    setIsLogged,
    currentUser,
    setCurrentUser,
    userImg,
    setUserImg,
  } = useContext(UserContext);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [preview, setPreview] = useState(null);
  const [editedImg, setEditedImg] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [newUserData, setNewUserData] = useState({});

  const userImgRef = useRef(null);
  const AvatarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(()=>{
    setNewUserData({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email ,
    })
  },[currentUser])

  useEffect(() => {
    const token = getCookie('token');

    if (token) {
      axios.post('/check-web-token', { token: token }).then((data) => {
        if (data.data.status === true) {
          setIsLogged(true);
          setUserImg(data.data.userImg);
        }
      });
    } else {
      navigate('/');
    }

  }, []);

  const selectFile = () => {
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    fileInput.click();

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        const selectedFile = fileInput.files[0];

        const reader = new FileReader();

        reader.onload = function (event) {
          setPreview(true);
          const fileContent = event.target.result;
          setUserImg(fileContent);
        };

        reader.readAsDataURL(selectedFile);
      } else {
        console.log('No file selected');
      }
    });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewUserData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };


  const handleChangeUserData = (e) => {
    e.preventDefault();

    if(newUserData.firstName != currentUser.firstName  || newUserData.lastName != currentUser.lastName  || newUserData.email != currentUser.email    ){
      console.log(newUserData);

     axios
      .put('/updateUserData', {
        currentUserId: currentUser.userId,
        newUserData: newUserData,
      })
      .then((response) => {
        const updatedUserData = response.data;
        console.log('Updated user data:', updatedUserData);
        alert('user data Updated Successfully');
        setNewUserData({
          firstName: updatedUserData.firstName,
          lastName: updatedUserData.lastName,
          email: updatedUserData.email ,
        });

        currentUser.firstName = updatedUserData.firstName
        currentUser.lastName = updatedUserData.lastName
        currentUser.email =  updatedUserData.email

      })
      .catch((error) => {
        console.error('Error updating user data:', error);
      });

    }else{
      alert('No changes .. !')
    }
 
  };

  const onClose = () => {
    setPreview(null);

    setTimeout(() => {
      userImgRef.current.src = editedImg;
    }, 1);
  };

  const onCrop = (view) => {
    setEditedImg(view);
    axios.post('/updateImg', {
      currentUserId: currentUser.userId,
      imgBuffer: view,
    });
  };

  return isLogged ? (
    <>
      <motion.div
        className='min-h-screen w-full'
        initial={{ x: isOpen ? '100%' : 0 }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className='px-3 xl:px-56 py-4 text-textWhite bg-darkGreen'>
          <i
            className='fa-solid fa-arrow-left cursor-pointer'
            onClick={() => {
              setIsOpen(false);
              setTimeout(() => {
                window.history.back();
              }, 300);
            }}
          ></i>
          <div className='flex flex-col justify-center items-center mt-4'>
            <div className='relative'>
              {preview ? (
                <Avatar
                ref={AvatarRef}
                  width={400}
                  height={300}
                  onCrop={onCrop}
                  onClose={onClose}
                  src={userImg}
                />
              ) : (
                <>
                  <div className='h-40 w-40 rounded-full overflow-hidden'>
                    <img
                      ref={userImgRef}
                      src={userImg ? userImg : avatar}
                      alt='profile-image'
                      className='h-full w-full object-cover inline-block align-middle'
                    />
                  </div>
                  <i
                    className='w-8 h-8 flex text-t justify-center items-center fa-solid fa-camera text-lg absolute right-0 bottom-5 rounded-full bg-[#94949481] cursor-pointer text-textDark hover:bg-[#a9a8a881]'
                    onClick={selectFile}
                  ></i>
                </>
              )}
            </div>

            <p className='capitalize text-lg font-bold'>
              {currentUser.firstName} {currentUser.lastName}
            </p>
          </div>
        </div>

        <div className='mx-auto max-w-[500px] text-textWhite bg-bgDark lg:w-[500px]'>
          <h2 className='text-center font-bold text-2xl mt-3'>Edit Profile</h2>

          <form
            className='flex flex-col gap-3 px-3 py-5 '
            onSubmit={handleChangeUserData}
          >
            <div>
              <label htmlFor='firstName'>FirstName</label>
              <input
                type='text'
                id='firstName'
                placeholder={currentUser.firstName}
                className='border w-full rounded-lg p-1 placeholder:text-textDark text-textDark'
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor='lastName'>LastName</label>
              <input
                type='text'
                id='lastName'
                placeholder={currentUser.lastName}
                className='border w-full rounded-lg p-1 placeholder:text-textDark text-textDark'
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor='email'>Email</label>
              <input
                type='email'
                id='email'
                placeholder={currentUser.email}
                className='border w-full rounded-lg p-1 placeholder:text-textDark text-textDark'
                onChange={handleChange}
              />
            </div>
            <button className='w-fit p-1 rounded-md capitalize text-textBlue hover:bg-primary hover:text-textWhite border font-medium duration-200 delay-75'>
              save changes
            </button>
          </form>

          <h2 className='text-center font-bold text-2xl mt-3 capitalize'>
            change password
          </h2>

          <form className='flex flex-col gap-3 px-3 py-5'>
            <div className='relative'>
              <label htmlFor='currentPassword'>Current Password</label>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id='currentPassword'
                className='border w-full rounded-lg p-1 text-textDark'
              />

              {showCurrentPassword ? (
                <i
                  className='fa-solid fa-eye-slash absolute right-3 top-8 cursor-pointer text-textDark'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                ></i>
              ) : (
                <i
                  className='fa-solid fa-eye absolute right-3 top-8 cursor-pointer text-textDark'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                ></i>
              )}
            </div>

            <div className='relative'>
              <label htmlFor='newPassword'>New Password</label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                id='newPassword'
                className='border w-full rounded-lg p-1 text-textDark'
              />

              {showNewPassword ? (
                <i
                  className='fa-solid fa-eye-slash absolute right-3 top-8 cursor-pointer text-textDark'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                ></i>
              ) : (
                <i
                  className='fa-solid fa-eye absolute right-3 top-8 cursor-pointer text-textDark'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                ></i>
              )}
            </div>
            <button className='w-fit p-1 rounded-md capitalize text-textBlue hover:bg-primary hover:text-textWhite border font-medium duration-200 delay-75'>
              change Password
            </button>
          </form>
        </div>
      </motion.div>
    </>
  ) : null;
};

export default Profile;
