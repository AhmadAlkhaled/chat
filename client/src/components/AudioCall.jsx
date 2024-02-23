import avatar from '../assets/images/img_avatar.png';
import { useEffect, useState , useContext, createElement , useRef } from 'react';
import { UserContext } from '../components/UserContextProvider';
import  Peer  from "peerjs";
import callLoader from '../assets/images/callLoder.svg';



const AudioCall = (props)=>{
 
    const { socket , currentUser , friends , onlineUsers } = useContext(UserContext);
    const [ callingState , setCallingState ] = useState('Calling..');
    const [ friend , setFriend ] = useState(null);
    const [ callStart, setCallStart] = useState(false);
    const [counter, setCounter] = useState(0);
    const [friendPeerId, setFriendPeerId] = useState(null);
    const [mic, setMic] = useState(true);
    const [speker, setspeker] = useState(true);

    const audioRef = useRef(null);
    const peer = new Peer();


    const startCall =  () => {
        socket.emit('startCall' , friend.socketId);
        setCallStart(true);
        setInterval(() => {
            setCounter((prevCounter) => prevCounter + 1);
        }, 1000);

        if(friendPeerId){
            navigator.mediaDevices.getUserMedia({ audio:true })
            .then((audioStream)=>{
              const call =  peer.call(friendPeerId, audioStream );
                call.on('stream', function(remoteStream) {
                    audioRef.current.srcObject = remoteStream ;
                })
            });
        };
    };

    useEffect(()=>{
        peer.on('open', function(){
            friends.map((friend)=>{
                if(friend._id === props.CallingData?.userId && friend.socketId ){
                    socket.emit('peerId' ,{ socketId : friend.socketId , peerId : peer.id } )
                }
            })
            socket.emit('peerId' ,{ socketId : props.currentChatUser?.socketId , peerId : peer.id } )
        });
    },[])

  
    useEffect(()=>{
        
        if(props.CallingData){
            friends.map(  (friend)=>{
                if(friend._id == props.CallingData.userId){
                    setFriend(friend);
                    setCallingState('Calls..');
                }
            });
        }else{
            if( props.status ){
          
                socket.emit('audioCalling' , { from : currentUser , to :  props.currentChatUser } )
            }else{
               setCallingState(` ${props.currentChatUser.firstName} cannot be called  Now .. `)
               setTimeout(() => {
                   props.setIsCallingAudio(false);
               }, 5000);
            }
        }

        socket.on('closeCalling',()=>{
          if(props.setIsCalling)
          {
            trackStop();
            props.setIsCalling(false);
          }else{
            trackStop();
            props.setIsCallingAudio(false);
          }    
        })

        socket.on('peerId',(peerId)=>{
            setFriendPeerId(peerId);
        })

        socket.on('startCall' , ()=>{
            setCallStart(true);
            setInterval(() => {
                setCounter((prevCounter) => prevCounter + 1);
            }, 1000);
        });

        peer.on('call', function(call) {
            navigator.mediaDevices.getUserMedia({ audio:true })
            .then((audioStream)=>{
                call.answer(audioStream); 
                call.on('stream', function(remoteStream) {
                    audioRef.current.srcObject = remoteStream ;
                })
            });
        });
    },[]);


    const disconnectCall = () => {
        if (peer) {
            const activeConnections = Object.values(peer.connections);
            activeConnections.forEach(connections => {
                connections.forEach(connection => {
                    connection.close();
                });
            });
        }
        setCallStart(false);
        setCounter(0);
        setspeker(true);
        setMic(true);

        if (friend) {
            socket.emit('closeCalling', friend.socketId);
            props.setIsCalling(false);
        } else {
            socket.emit('closeCalling', props.currentChatUser.socketId);
            props.setIsCallingAudio(false);
        }
        if (audioRef.current) {
            trackStop();
        }
    };


    
    const  trackStop = ()=>{
    
        if(audioRef.current?.srcObject){
            const tracks = audioRef.current.srcObject.getTracks();
            tracks.forEach(track => {
                console.log(track);
                try {
                    track.stop();
                    console.log('track.stop();');
                } catch (error) {
                    console.log('Error stopping track:', error);
                }
            });
        }
    }

    return(
        <div className="w-full bg-primary absolute top-0 h-full  flex justify-center items-center z-40 " >
       
          <audio  ref={audioRef} autoPlay  ></audio>
            <div className=' w-[400px] h-[700px]   bg-textDark  flex flex-col items-center justify-center rounded-[30px] p-[60px]  '>
                <img
                    src={props.currentChatUser?.userImg ? props.currentChatUser.userImg : friend?.userImg ? friend.userImg :  avatar}
                    alt='avatar'
                    className='h-[200px] w-[200px] rounded-full object-cover inline-block align-middle'
                 />  
                 {
                    callStart?
                     null
                    :
                    <div className='h-[30px] flex items-center  mt-[20px] ' >
                    <img src={callLoader} alt="Description" />
                </div> 
                 }
                 
            
                 <p className=' text-[20px] text-textWhite  mt-[20px]' >  { friend ?  friend.firstName : props.currentChatUser?.firstName} { friend ?  friend.lastName : props.currentChatUser?.lastName} </p>     
                 <span className={`text-[30px] ${ callStart? ' text-textGreen bg-textBlueHover py-[0px] px-[30px] rounded-[50px] ' : 'text-textWhite' }  mt-[20px] text-center`}  >  {callStart? `${ Math.floor(counter / 60) }:${ ('0' + (counter % 60)).slice(-2) } `: callingState }   </span>

         
                 <div className={` flex w-full justify-center mt-[100px]  ${ callStart ? 'gap-[50px]' : 'gap-[100px]' }   `} >
                    
                    {
                     callStart? 
                     speker?
                        <i className="fa-solid fa-volume-high  text-textWhite text-[30px] cursor-pointer bg-textGray py-[19px] px-[19px] rounded-[50%]"
                            onClick={()=>{
                                setspeker(false);
                                if (audioRef.current) {
                                    audioRef.current.muted = true;
                                }
                            }}
                        ></i>
                        :
                        <i className="fa-solid fa-volume-xmark text-textWhite text-[30px] cursor-pointer bg-textGray py-[19px] px-[21px] rounded-[50%]" 
                            onClick={()=>{
                                setspeker(true);
                                if (audioRef.current) {
                                    audioRef.current.muted = false;
                                }
                            }}
                        ></i>
                     :null 
                    }
                    <i className={`fa-solid fa-phone-flip  text-textWhite text-[30px] cursor-pointer  bg-iconRed  py-[19px] px-[20px] rounded-[50%] transition-all `}
                        onClick={disconnectCall}
                    ></i>

                    {
                     friend ?
                        callStart? null :
                        <i className="fa-solid fa-check  text-textWhite text-[40px] cursor-pointer bg-textGreen py-[15px] px-[20px] rounded-[50%]"
                            onClick={startCall}
                        ></i>
                     :null
                    }

                    {
                     callStart? 
                     mic?
                        <i className="fa-solid fa-microphone  text-textWhite text-[30px] cursor-pointer bg-textGray py-[20px] px-[26px] rounded-[50%]"
                            onClick={()=>{
                                setMic(false);
                                if (audioRef.current) {
                                    const tracks = audioRef.current.srcObject.getTracks();
                                    if (tracks) {
                                        tracks.forEach(track => {
                                            track.stop();
                                        });
                                    }
                                }
                            }}
                        ></i>
                        :
                        <i className="fa-solid fa-microphone-slash text-textWhite text-[30px] cursor-pointer bg-textGray py-[20px] px-[18px] rounded-[50%]"
                            onClick={()=>{
                                setMic(true);
                                navigator.mediaDevices.getUserMedia({ audio:true })
                                .then((audioStream)=>{
                                    audioRef.current.srcObject = audioStream;
                                });
                            }}
                        ></i>
                     :null 
                    }
                 </div>
            </div>
        </div>
    )
}

export default AudioCall