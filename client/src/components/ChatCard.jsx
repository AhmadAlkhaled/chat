import avatar from '../assets/images/img_avatar.png';
import { useContext, useState } from 'react';
import { UserContext } from '../components';
import axios from 'axios';
import AlertForChanges from '../components/AlertForChanges';

const ChatCard = ({ onClick, user, search }) => {
  const { setIsVisible, currentUser, setFriends , mobileVision } = useContext(UserContext);
  const [deleteIcon, setDeleteIcon] = useState(false);
  const [showAlert, setShowAlert] = useState(false);


  const handleAddUser = (e, friedUserId) => {
    e.stopPropagation();

    axios
      .post('/addNewUser', {
        currentUserId: currentUser.userId,
        friedUserId: friedUserId,
      })
      .then((friendData) => {
        setFriends(friendData.data);
      });
  };

  const callBack = (e) => {
    e.stopPropagation();
    setShowAlert(false);
  };

  const deleteFunc = (e) => {
    e.stopPropagation();
    axios.post('/deleteUser', { user, currentUser }).then((res) => {
      setFriends(res.data);
    });
  };

  return (
    <section
      onClick={() => {
        onClick(user);
      }}
      className='w-full hover:bg-bgLight text-textWhite border-b-2 border-bgLight px-4 py-1 flex justify-between items-center cursor-pointer md:px-3'
    >
      <div className='flex items-center gap-2 '>
        <div className='relative'>
          {!search ? (
            <span
              className={`w-3 h-3  ${
                user.status ? 'bg-textGreen' : 'bg-iconRed'
              }  rounded-full border-2 border-bgLight absolute right-0 bottom-2`}
            ></span>
          ) : null}
          <img
            src={user.userImg ? user.userImg : avatar}
            alt='avatar'
            className='h-16 w-16 rounded-full object-cover inline-block align-middle z-0'
          />
          {
             user.newMessage ?
            <div className='bg-iconRed flex justify-center items-center w-[25px] h-[25px] absolute top-0 rounded-[50%] ' > new </div>
            :null
          }
        </div>

        <p className='capitalize'>
          {user.firstName} {user.lastName}
        </p>
      </div>

      <div className={`  flex gap-3  `}>

        {search ? (
          user.isFriend ? (
            'Friend'
          ) : (
            <button
              onClick={(e) => handleAddUser(e, user._id)}
              className='px-2 py-1 bg-textGreen text-bgLight rounded-md font-bold'
            >
              add
            </button>
          )
        ) : (
          <div className='relative  flex gap-3'>
            {user.status ? (
              <p className='text-textGreen font-bold '>Online</p>
            ) : (
              <p className=' text-right'>
                last online
                {' ' + user.lastOnline.split(',')[1].trim()}
              </p>
            )}

            {deleteIcon ? (
              <div
                className='flex justify-center gap-2 absolute w-fit px-2 py-2 bg-[#0000005e] right-0 top-7 backdrop-blur-sm border border-darkGreen rounded-sm '

                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <i

                  className='fa-solid fa-user-minus hover:text-textGreen'
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteIcon(false);
                    setShowAlert(true);
                    
                  }}
                ></i>
        
              </div>
            ) : null}
            <i
              className='fa-solid fa-ellipsis-vertical text-xl cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                setDeleteIcon(!deleteIcon);
              }}
            ></i>
          </div>
        )}
        {showAlert && (
          <AlertForChanges
            callBack={callBack}
            deleteFunc={deleteFunc}
            user={user}
          />
        )}

      </div>
    </section>
  );
};

export default ChatCard;
