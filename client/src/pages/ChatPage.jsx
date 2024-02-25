import avatar from '../assets/images/img_avatar.png';
import ChatCard from '../components/ChatCard';
import ChatContainer from '../components/ChatContainer';
import { useContext, useEffect, useRef, useState } from 'react';
import { DefaultChatContainer, UserContext } from '../components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import { getCookie } from '../components/UserContextProvider';
import { motion } from 'framer-motion';
import AudioCall from '../components/AudioCall'
import VideoCall from '../components/VideoCall'


const ChatPage = () => {
  const {
    isVisible,
    mobileVision,
    setCurrentUser,
    currentUser,
    setUserId,
    setIsVisible,
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
  } = useContext(UserContext);
  const [search, setSearch] = useState({ status: false, type: 'addNewFriend' });
  const [findUsers, setFindUsers] = useState([]);
  const [currentChatUser, setCurrentChatUser] = useState({});
  const [menu, setMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [ isCalling ,setIsCalling ] = useState(false);
  const [ CallingData ,setCallingData ] = useState();
  const [ CallVideo , setCallVideo ] = useState(false);
  const [ videoCallingData ,setVideoCallingData ] = useState();




  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie('token');
    const socket = io('https://chat-xcrm.onrender.com/', {
      query: {
        token: getCookie('token'),
      },
    });
    setSocket(socket);

    if (token) {
      const decodedToken = jwtDecode(token);
      setCurrentUser(decodedToken);

      axios
        .post('/check-web-token', { token: token })
        .then((response) => {
          const { data } = response;
          setUserImg(data.userImg);
          if (!data.status) {
            navigate('/');
          }
        })
        .catch((error) => {
          console.error('Error occurred:', error);
        });
    } else {
      navigate('/');
    }

    socket.on('onlineUsers', (data) => {
      setOnlineUsers(data);
    });

    socket.on('message', (msg) => {
      messages.push(msg);
      setMessages([...messages]);
    });

    socket.on('call', (data) => {
      setIsCalling(true);
      setCallingData(data)
    });

    socket.on('videoCall', (data) => {
      setVideoCallingData(data);
      setCallVideo(true);
    });

  }, []);

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      const decodedToken = jwtDecode(token);

      axios
        .post('/getFriends', { id: decodedToken.userId })
        .then((data) => {
          setFriends(data.data.findUsers);
        });
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (messages.length) {
      const arr = friends.filter((friend) => {
        if (messages[messages.length - 1].currentUserId == friend._id) {
          friend.newMessage = true;
        } else {
          friend.newMessage = false;
        }
        return friend;
      });
      setFriends(arr);
    }
  }, [messages]);

  useEffect(() => {
    if (friends.length > 0 && onlineUsers.length > 0) {
      const updatedFriends = friends.map((friend) => {
        const onlineFriend = onlineUsers.find(
          (onlineUser) => onlineUser.userId === friend._id
        );
        if (onlineFriend) {
          return {
            ...friend,
            status: true,
            socketId: onlineFriend.socketId,
          };
        } else {
          return {
            ...friend,
            status: false,
            socketId: null,
          };
        }
      });

      const areFriendsDifferent =
        JSON.stringify(friends) !== JSON.stringify(updatedFriends);

      if (areFriendsDifferent) {
        setFriends(updatedFriends);
      }
      
    }
  }, [friends, onlineUsers]);

  const handleSearch = (searchText) => {
    socket.emit(search.type, searchText);
    socket.on('findUsers', (users) => {
      let arr = users.filter((user) => {
        return (
          searchText.toLowerCase() ==
          user.firstName.substr(0, searchText.length).toLowerCase()
        );
      });

      const arr1 = users.filter((user) => {
        return (
          searchText.toLowerCase() !==
          user.firstName.substr(0, searchText.length).toLowerCase()
        );
      });
      const x = [...arr, ...arr1];

      const x1 = x.filter((user) => {
        return user._id != currentUser.userId;
      });
      setFindUsers(x1);
    });
  };

  const handleChat = (user) => {
    setCurrentChatUser(user);
    setIsVisible(true);
  };

  const handleLogOut = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.clear();
    navigate('/');
    socket.disconnect();
  };

  const handleFullscreen = () => {
    const fullscreen = document.getElementById('chatPage');
    const isFullscreen = document.fullscreenElement;

    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      fullscreen.requestFullscreen();
    }
  };

  return (
    <div className='flex' id='chatPage'>
      {(!isVisible && mobileVision) || !mobileVision ? (
        <header className='fixed top-0 w-full h-16 flex justify-between items-center px-4 py-1 z-10 lg:w-[30%] lg:min-w-[375px] bg-darkGreen'>
          <img
            src={userImg ? userImg : avatar}
            alt='avatar image'
            className='h-12 w-12 rounded-full object-cover inline-block align-middle cursor-pointer'
            onClick={() => navigate('/profile')}
          />
           <div className=' text-textWhite  bg-[#0000005e] px-[10px] py-[5px] ml-[10px] rounded-lg ' > { currentUser.firstName }  </div> 

          <div className='w-full flex justify-end items-center'>
            <input
              ref={searchInputRef}
              type='text'
              placeholder={
                search.type === 'addNewFriend'
                  ? 'Look for a new friends ...'
                  : 'Search in my friends list ...'
              }
              className={`w-full px-2 py-1 flex-1 mx-3 rounded-md outline-none ${
                isSearchOpen ? 'block' : 'hidden'
              }`}
              onChange={(e) => {
                handleSearch(e.target.value);
              }}
            />

            <div className='flex gap-3'>
              <i
                className='fa-solid fa-user-plus text-xl cursor-pointer text-textWhite'
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setSearch({
                    status: !search.status
                      ? true
                      : search.type === 'addNewFriend'
                      ? false
                      : true,
                    type: 'addNewFriend',
                  });
                  setTimeout(() => {
                    searchInputRef.current.focus();
                  }, 100);
                  searchInputRef.current.value = '';
                }}
              ></i>

              <i
                className='fa-solid fa-magnifying-glass text-xl cursor-pointer text-textWhite'
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setSearch({
                    status: !search.status
                      ? true
                      : search.type === 'searchFriend'
                      ? false
                      : true,
                    type: 'searchFriend',
                  });
                  setTimeout(() => {
                    searchInputRef.current.focus();
                  }, 100);
                  searchInputRef.current.value = '';
                }}
              ></i>

              <i
                className='fa-solid fa-ellipsis-vertical text-xl cursor-pointer text-textWhite'
                onClick={() => {
                  setMenu(!menu);
                }}
              ></i>
            </div>
          </div>

          <motion.div
            className={`absolute w-[200px] top-[64px] right-3 z-10 bg-[#0000005e]  text-textWhite 
            backdrop-blur-sm rounded-b-lg overflow-hidden
            }`}
            initial={{ height: 0 }}
            animate={{ height: menu ? 'auto' : 0   }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p
              className='p-2 cursor-pointer border-darkGreen hover:border-l-[5px] duration-75 font-bold last:rounded-b-md'
              onClick={() => {
                navigate('/profile');
              }}
            >
              Profile
            </p>
            <p
              className='p-2 cursor-pointer border-darkGreen hover:border-l-[5px] duration-75 font-bold last:rounded-b-md'
              onClick={handleFullscreen}
            >
              Fullscreen
            </p>
            <p
              className='p-2 cursor-pointer border-darkGreen hover:border-l-[5px] duration-75 font-bold last:rounded-b-md'
              onClick={handleLogOut}
            >
              Logout
            </p>
          </motion.div>
        </header>
      ) : null}

      <main
        className={`w-screen h-screen flex justify-between scrollbar-none overflow-y-scroll lg:w-[30%] lg:min-w-[375px] ${
          isVisible && mobileVision ? 'hidden' : 'block'
        } ${!mobileVision && 'border-r-4 border-bgLight'} `}
      >
        <section className='w-full h-full'>
          <div className='mt-[63px] flex flex-col relative'>
            {findUsers.length ? (
              <div className=' z-10 h-full w-full bg-bgLight absolute'>
                {findUsers.map((user, i) => {
                  friends.map((friend) => {
                    if (friend._id == user._id) {
                      user.isFriend = true;
                    }
                    console.log(friend._id);
                  });
                  return <ChatCard key={i} search={'search'} user={user} />;
                })}
              </div>
            ) : (
              <div>
                {friends.map((friend, i) => {
                  return (
                    <ChatCard
                      onClick={handleChat}
                      key={i}
                      user={{
                        firstName: friend.firstName,
                        lastName: friend.lastName,
                        status: friend.status,
                        id: friend._id,
                        socketId: friend.socketId,
                        newMessage: friend.newMessage,
                        lastOnline: friend.lastOnline,
                        userImg: friend.userImg,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {isVisible ? (
        <ChatContainer currentChatUser={currentChatUser}  />
      ) : (
        
        <DefaultChatContainer />
      )}

      {
        isCalling?
        <AudioCall CallingData={CallingData} setIsCalling={setIsCalling} />:null
      }

      {CallVideo ?
        <VideoCall ICall={false} setCallVideo={setCallVideo} currentChatUser={currentChatUser} videoCallingData={videoCallingData} />
      :null
      }
    </div>
  );
};

export default ChatPage;
