import chatBg from '../assets/images/bg_dark.svg';
import avatar from '../assets/images/img_avatar.png';
import axios from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../components';
import EmojiPicker from 'emoji-picker-react';
import AudioCall from './AudioCall'
import AudioPlayer from 'react-h5-audio-player';
import VideoCall from '../components/VideoCall'
import 'react-h5-audio-player/lib/styles.css';

let mediaRecorder;
let chunks = [];

const ChatContainer = ({ currentChatUser }) => {

  const [currentMessages, setCurrentMessages] = useState([]);
  const [loader, setLoader] = useState(true);
  const [displayEmojiPicker, setDisplayEmojiPicker] = useState(false);
  const [userTyping, setUserTyping] = useState(true);
  const [counter, setCounter] = useState(0);
  const [audioRecording, setAudioRecording] = useState(false);
  const [file, setFile] = useState(null);
  const [ isCallingAudio, setIsCallingAudio] = useState(false);
  const [ CallVideo , setCallVideo ] = useState(false)
  const [ status , setStatus ] = useState(false)
  const messageFieldRef = useRef(null);
  const messagesBoxRef = useRef(null);
  const pressTimer = useRef(null);

  const { setIsVisible, mobileVision, currentUser, messages, friends, socket } = useContext(UserContext);




  useEffect(() => {
    setCurrentMessages([]);
    setLoader(true);
    axios.post('/getChats', { currentUserID: currentUser.userId, currentChatUserID: currentChatUser.id })
      .then((data) => {
        setCurrentMessages(data.data.AllMessages);
        setLoader(false);
      });
  
  }, [currentChatUser]);

  useEffect(()=>{
    friends.map((friend)=>{
      if(currentChatUser.id === friend._id){
   
        setStatus(friend.status);
        currentChatUser.socketId = friend.socketId
      }
    })

  },[friends , currentChatUser])

  useEffect(() => {
    friends.forEach((friend) => {
      if (currentChatUser.id === friend._id) {
        friend.newMessage = false;
      }
    });
    messages.forEach((message) => {
      setCurrentMessages([...currentMessages, message]);
    });
  }, [messages]);

  const sendMessage = () => {
    setDisplayEmojiPicker(false);
    if (messageFieldRef.current.value) {
      const date = new Date();
      let message;
      if (file) {
        message = {
          from: currentUser.userId,
          to: currentChatUser.id,
          content: { file: file },
          date: date,
          currentChatUserSocketId: currentChatUser.socketId,
        };
        setFile(null);
      } else {
        message = {
          from: currentUser.userId,
          to: currentChatUser.id,
          content: { text: messageFieldRef.current.value },
          date: date,
          currentChatUserSocketId: currentChatUser.socketId,
        };
        setFile(null);
      }
      socket.emit('message', message);
      setCurrentMessages([...currentMessages, message]);
      messageFieldRef.current.value = '';
    }
  };

  useEffect(()=>{

    if (messageFieldRef.current.value) {
      setUserTyping(true);
    }else{
      setUserTyping(false);
    }

    if (messagesBoxRef.current  ) {
        messagesBoxRef.current.scrollTo({
          top: messagesBoxRef.current.scrollHeight,
        });
    }

  });

  const selectFile = () => {
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.click();

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        const selectedFile = fileInput.files[0];

        const reader = new FileReader();

        reader.onload = function (event) {
          const fileContent = event.target.result;
          const file = {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            fileContent: fileContent,
          };
          setFile(file);

          let fileIcon;
          if (file.type === 'application/pdf') {
            fileIcon = ' 📄 ';
          } else if (file.type.substring(0, 5) === 'image') {
            fileIcon = ' 🖼️ ';
          } else {
            fileIcon = ' 📁 ';
          }

          messageFieldRef.current.value = file.name + fileIcon;
        };

        reader.readAsDataURL(selectedFile);
      } else {
        console.log('No file selected');
      }
    });
  };


  const startRecording = async () => {

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
   
      mediaRecorder.start();
    } catch (err) {
      console.error('Error accessing the microphone:', err);
    }

  };
  
   const stopRecording = () => {
 
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
   };


  
   const sendVoice = async () => {
    await stopRecording();

    setTimeout(() => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64data = reader.result; 
        const audioContext = new AudioContext();
          const arrayBuffer = await fetch(base64data).then(response => response.arrayBuffer());
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const duration = audioBuffer.duration;

        const message = {
          from: currentUser.userId,
          to: currentChatUser.id,
          currentChatUserSocketId: currentChatUser.socketId,
          content: { file: { name: 'Audio', data: base64data , duration : duration } }, 
          date: new Date(),
        };
        
        setCurrentMessages([...currentMessages, { ...message }]); 
        socket.emit('message', message);
      };
    
      setAudioRecording(false);
      clearInterval(pressTimer.current);
      setCounter(0);
      
    }, 100);

  };

  const startCallingAudio = ()=>{
    setIsCallingAudio(true);
  }

  const startCallVideo  =( )=>{
    setCallVideo(true);
  }


  return (
    <div className='min-h-screen w-screen relative lg:w-[70%] '>
      <nav className='fixed top-0 lg:w-[70%] w-[100%]   h-16 flex justify-between gap-2 items-center px-2 py-1 bg-[rgba(6,6,6,0.57)] z-10 '>
        <div  className='flex gap-2 w-[80%]  items-center px-2 py-1 ' >
          <i
            className={`fa-solid ${
              mobileVision ? 'fa-arrow-left' : 'fa-xmark'
            }  text-textWhite cursor-pointer text-xl`}
            onClick={() => {
              setIsVisible(false);
            }}
          ></i>

            <div className=' relative ' >
              <img
                src={currentChatUser.userImg ? currentChatUser.userImg : avatar}
                alt='avatar'
                className='h-12 w-12 rounded-full object-cover inline-block align-middle'
              />

              <span
              className={`w-3 h-3  ${
                status ? 'bg-textGreen' : 'bg-iconRed'
              }  rounded-full border-2 border-bgLight absolute right-0 bottom-1`}
              ></span>
            </div>
        
       
          <div className='text-textWhite flex flex-col'>
            <span>
              {currentChatUser.firstName} {currentChatUser.lastName}
            </span>
            <span className={`${status ?'text-textGreen':'text-textWhite'}  text-[14px] font-bold `} >
              {status ? 'Online' : null}
              {status ? null : 'last online'}
                
              {status ?null : ' ' + currentChatUser.lastOnline.split(',')[1].trim().substring(0,2) == new Date().getDate() ? currentChatUser.lastOnline.split(',')[1].trim().substring(0,2) == new Date().getDate()-1 ? 'Yesterday' : ' Today' : currentChatUser.lastOnline.split(',')[1].trim() }
              {status ? null : ' at ' + currentChatUser.lastOnline.split(',')[0].trim() } 

            </span>
          </div>

        </div>

        <div className=' text-[20px] w-[20%] text-textWhite flex items-center justify-center gap-[30px]  pr-[10px]  ' >
           <i className="fa-solid fa-phone-volume cursor-pointer hover:text-textGreen "
            onClick={startCallingAudio}
          ></i> 
           <i className="fa-solid fa-video cursor-pointer hover:text-textGreen"
           onClick={ startCallVideo }
           ></i> 
        </div>

      </nav>

      <div
        className={`${
          loader && 'flex justify-center items-center'
        } w-full h-full pt-[64px] `}
        style={{
          backgroundImage: `url(${chatBg})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px',
        }}
      >
        {loader ? (
          <div className='w-16'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
              <circle
                fill='#09BE8B'
                stroke='#09BE8B'
                strokeWidth='13'
                r='15'
                cx='40'
                cy='65'
              >
                <animate
                  attributeName='cy'
                  calcMode='spline'
                  dur='2'
                  values='65;135;65;'
                  keySplines='.5 0 .5 1;.5 0 .5 1'
                  repeatCount='indefinite'
                  begin='-.4'
                ></animate>
              </circle>
              <circle
                fill='#09BE8B'
                stroke='#09BE8B'
                strokeWidth='13'
                r='15'
                cx='100'
                cy='65'
              >
                <animate
                  attributeName='cy'
                  calcMode='spline'
                  dur='2'
                  values='65;135;65;'
                  keySplines='.5 0 .5 1;.5 0 .5 1'
                  repeatCount='indefinite'
                  begin='-.2'
                ></animate>
              </circle>
              <circle
                fill='#09BE8B'
                stroke='#09BE8B'
                strokeWidth='13'
                r='15'
                cx='160'
                cy='65'
              >
                <animate
                  attributeName='cy'
                  calcMode='spline'
                  dur='2'
                  values='65;135;65;'
                  keySplines='.5 0 .5 1;.5 0 .5 1'
                  repeatCount='indefinite'
                  begin='0'
                ></animate>
              </circle>
            </svg>
          </div>
        ) : (
          <div
            ref={messagesBoxRef}
            className='overflow-scroll w-full h-[86vh] p-[10px] flex flex-col'
          >
            {currentMessages.map((msg, i) => {
              const dateObject = new Date(msg.date);
              const currentDate = new Date();

              return (
                <div
                  className={`select-text max-w-xs w-fit h-auto ${
                    typeof msg.content.text === 'string'
                      ? mobileVision
                        ? 'w-[90%]'
                        : 'w-[50%]'
                      : 'w-[300px]'
                  }  p-[10px] mb-[10px] break-words ${
                    currentChatUser.id === msg.from
                      ? 'self-start rounded-r-lg rounded-bl-lg bg-[#d6d5d5] text-textDark'
                      : 'self-end rounded-l-lg rounded-br-lg bg-secondary text-textWhite'
                  }`}
                  key={i}
                >
                  <div
                    className={`${
                      currentChatUser.id === msg.from
                        ? 'text-textDark'
                        : 'text-textWhite'
                    } w-full flex justify-between gap-5 mt-[-5px] mb-2`}
                  >
                    <span>
                      {currentUser.userId === msg.from
                        ? 'You'
                        : currentChatUser.firstName[0].toUpperCase() +
                          currentChatUser.firstName.slice(1)}
                    </span>
                    {currentDate.getDate() === dateObject.getDate() ? (
                      <span>
                        {`${dateObject.getHours()} : ${String(
                          dateObject.getMinutes()
                        ).padStart(2, '0')}`}
                      </span>
                    ) : (
                      <span>
                        {dateObject.getDate()}.{dateObject.getMonth() + 1}.
                        {dateObject.getFullYear()}
                      </span>
                    )}
                  </div>
                  {typeof msg.content.text === 'string' ? (
                    msg.content.text
                  ) : (
                      msg.content.file.name === 'Audio'   ?
              
                      <div  className='w-[300px] rounded-xl overflow-hidden ' >
                        <AudioPlayer 
                          src={msg.content.file.data} 
                          defaultDuration={ msg.content.file.duration }
                          showJumpControls={false} 
                        />
                      </div>
                 
                      :
                    <div className='w-full bg-bgDark rounded-lg overflow-hidden'>
                      <div
                        title={msg.content.file.name}
                        className='px-2 flex text-textWhite justify-between items-center text-sm '
                      >
                        {msg.content.file.name.length <= 32
                          ? msg.content.file.name
                          : msg.content.file.name.substring(0, 32) + '...'}
                        <a
                          href={msg.content.file.fileContent}
                          title='download File'
                          download={msg.content.file.name}
                        >
                          <i
                            className='fa-solid fa-download cursor-pointer'
                            title='Download'
                          ></i>
                        </a>
                      </div>
                      <div className='w-full bg-textWhite'>
                        <embed
                          className='w-full h-auto embed-scrollbar'
                          type={msg.content.file.type}
                          src={msg.content.file.fileContent}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {displayEmojiPicker ? (
          <div className=' absolute bottom-[60px] left-[58px] '>
            <EmojiPicker
              onEmojiClick={(e) => {
                setUserTyping(true);
                messageFieldRef.current.value =
                  messageFieldRef.current.value + e.emoji;
              }}
            />
          </div>
        ) : null}

        <div className='h-8 w-full absolute bottom-0 mb-4 flex justify-center items-center gap-3 md:h-10 px-[10px]'>
          <i
            className='fa-solid fa-paperclip text-xl text-darkGreen cursor-pointer '
            onClick={selectFile}
          ></i>
          <i
            className='fa-solid fa-face-smile text-textYellow text-xl xs:text-2xl md:text-3xl cursor-pointer '
            onClick={() => {
              setDisplayEmojiPicker(!displayEmojiPicker);
            }}
          ></i>

            <input
              ref={messageFieldRef}
              type='text'
              placeholder='Start typing . . .'
              className='w-[75%] h-full bg-bgLight text-textWhite px-4 rounded-md placeholder:text-xs focus:outline-none sm:w-[80%] md:w-[85%] lg:placeholder:text-lg'
              onChange={(e) => {
                setUserTyping(true);
                if( !e.target.value ){
                  setFile(null);
                  setUserTyping(false);
              }
              }}
            />

          {
            userTyping ?
              <i
                className='fa-solid fa-location-arrow text-darkGreen text-xl xs:text-2xl md:text-3xl cursor-pointer '
                onClick={sendMessage}
              ></i>
            :
              audioRecording ?
                <i className="fa-solid fa-xmark  text-textGray text-xl xs:text-2xl md:text-3xl cursor-pointer   "
                    onClick={()=>{
                      setAudioRecording(false);
                      clearInterval(pressTimer.current);
                      setCounter(0);
                    }}
                ></i>
                :
                <i className="fa-solid fa-microphone text-textGray text-xl xs:text-2xl md:text-3xl cursor-pointer  "
                  onClick={()=>{
                    startRecording()
                    setAudioRecording(true)
                    pressTimer.current = setInterval(() => {
                      setCounter((prevCounter) => prevCounter + 1);
                    }, 1000);
                  }}
                ></i>
          }

          {
            audioRecording ?
            <div className=' flex items-center justify-around  text-lg w-[200px] h-[40px] bg-[#636363] rounded-md absolute right-[50px] bottom-[45px] ' >

              <div className="container">
                <div>  { Math.floor(counter / 60) }:{ ('0' + (counter % 60)).slice(-2) } </div>
                <div className="recording-circle"></div>
                <div className="recording-text">Recording</div>
              </div>

              <i className='fa-solid fa-location-arrow text-iconPrimary cursor-pointer '
                onClick={sendVoice}
               ></i>

            </div>
            :
            null
          }
        </div>
      </div>

      {
        isCallingAudio ?
        <AudioCall  currentChatUser={currentChatUser} setIsCallingAudio={setIsCallingAudio} status={status} />
        :null
      }

      {CallVideo ?
        <VideoCall ICall={true} setCallVideo={setCallVideo} currentChatUser={currentChatUser} />
      :null
      }

      
    </div>
  );
};

export default ChatContainer;
