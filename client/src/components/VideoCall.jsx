import avatar from '../assets/images/img_avatar.png';
import callLoader from '../assets/images/callLoder.svg';
import { useEffect, useState, useContext, useRef } from 'react';
import { UserContext } from '../components/UserContextProvider';
import  Peer  from "peerjs";


const VideoCall = (props)=>{
    const { socket , currentUser , friends , mobileVision } = useContext(UserContext);
    const [ callingState , setCallingState ] = useState('Calling..');
    const [friendPeerId, setFriendPeerId] = useState(null);
    const [startVideoCall, setStartVideoCall] = useState(false);
    const [CallStart, setCallStart] = useState(false);

    const peer = new Peer();
    const myCamraStream = useRef();
    const friendCamraStream = useRef();

    
    const startCall =  () => {
        if(friendPeerId){
            const call =  peer.call(friendPeerId, myCamraStream.current.srcObject );
            call.on("stream", (remoteStream) => {
                setStartVideoCall(true);
                setCallStart(true);
                setTimeout(() => {
                    friendCamraStream.current.srcObject = remoteStream;
                }, 10); 
            });      
        };
    };

    useEffect(()=>{
        peer.on('open', function(){
            console.log(peer.id);
            friends.map((friend)=>{
                if(friend._id === props.videoCallingData?.userId && friend.socketId ){
                    socket.emit('peerId' ,{ socketId : friend.socketId , peerId : peer.id } )
                }
            })
            socket.emit('peerId' ,{ socketId : props.currentChatUser?.socketId , peerId : peer.id } )
        });
    },[])

    useEffect(()=>{
        if(props.ICall){
            socket.emit('videoCall' , { from :currentUser , to : props.currentChatUser })
        }
        navigator.mediaDevices.getUserMedia({  video: true , audio:true })
        .then(function (stream) {
            myCamraStream.current.srcObject = stream;
        })
        .catch(function (error) {
            console.log('Error accessing webcam:', error);
        });

        socket.on('closeVideoCall', () => {
            trackStop();
            props.setCallVideo(false);
        });

        socket.on('peerId',(peerId)=>{
            setFriendPeerId(peerId);
            console.log('FriendPeerId ............');
            console.log(peerId);
        })

        peer.on('call', function(call) {
            call.answer( myCamraStream.current.srcObject ); 
            call.on('stream', function(remoteStream) {
                setStartVideoCall(true);
                setTimeout(() => {
                    friendCamraStream.current.srcObject = remoteStream;
                }, 10); 
            })
        });

    },[]);

    useEffect(()=>{
        if(!props.currentChatUser.status && props.ICall){
            setCallingState(` ${props.currentChatUser.firstName} cannot be called  Now .. `)
            setTimeout(() => {
                props.setCallVideo(false);
                
            }, 5000);
        }

        if(!props.ICall){
            setCallingState('Calls..');
        }

    },[])

    const closeVideoCall = () => {
        props.setCallVideo(false);
        if(props.ICall){
            socket.emit('closeVideoCall' , { id : props.currentChatUser.socketId });
        }else{
            friends.map((friend)=>{
                if(friend._id === props.videoCallingData.userId){
                    socket.emit('closeVideoCall' , { id : friend.socketId});
                }
            })
        }
        if (myCamraStream.current) {
                trackStop();
        }
    };

    const  trackStop = ()=>{
    
        if(myCamraStream.current?.srcObject){
            const tracks = myCamraStream.current.srcObject.getTracks();
            tracks.forEach(track => {
                try {
                    track.stop();
                } catch (error) {
                    console.log('Error stopping track:', error);
                }
            });
        }
    }

    const videoBoxMoving = (e) => {
        
        const element = e.target.parentElement;
        const elementRect = element.getBoundingClientRect();
        const initialX = elementRect.left;
        const initialY = elementRect.top;
        const offsetX = e.clientX - initialX;
        const offsetY = e.clientY - initialY;
        const thirdSize = 0.3 * window.innerWidth;
    
        const handleMouseMove = (event) => {
            let newX, newY;
            if (mobileVision) {
                newX = event.clientX - offsetX;
                newY = event.clientY - offsetY;
            } else {
                newX = event.clientX - offsetX - thirdSize;
                newY = event.clientY - offsetY;
            }
            newX = Math.max(0, Math.min(newX, window.innerWidth - element.offsetWidth));
            newY = Math.max(0, Math.min(newY, window.innerHeight - element.offsetHeight));
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
        };
    
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    



    return(
        <div className={` ${ mobileVision ? 'overflow-hidden' : '' }  absolute top-0 left-0 w-full h-[100vh] items-center justify-center gap-[5px] bg-secondary z-40 flex flex-wrap  `}>
            <div  className={` VideoBox1 h-[49%]  bg-[#27272A]  `}
                onMouseDown={videoBoxMoving}
            >

            <video ref={myCamraStream} className='w-[100%] h-[100%] object-cover ' autoPlay muted >
            </video>
                
                  
            </div>
            <div  className={` VideoBox  h-[49%] bg-[#27272A] flex justify-center items-center `} 
                onMouseDown={videoBoxMoving}
             >

                {
                    startVideoCall ? 
                    <video ref={friendCamraStream} className='w-[95%] h-[95%]  object-cover ' autoPlay  >
                    </video>
                    :
                    <div className=' w-full h-full bg-[#27272A] overflow-hidden flex flex-col justify-center items-center ' >
                        <img className=' mb-[20px]  ' src={callLoader} alt="Description" />
                        <img
                            src={ props.currentChatUser.img?props.currentChatUser.img  :  avatar}
                            alt='avatar'
                            className='h-[200px] w-[200px] rounded-full object-cover inline-block align-middle'
                        />  

                        <div className=' w-full text-center text-[30px] text-textWhite ' >
                            {props.videoCallingData? props.videoCallingData.firstName : props.currentChatUser.firstName } { props.videoCallingData? props.videoCallingData.lastName : props.currentChatUser.lastName }
                        </div>

                        <span className={`text-[30px] text-textWhite mt-[20px] text-center` } >   {callingState}    </span>
                    </div  >
                }
               

            </div>
            <div className=' w-[100%] absolute bottom-4 flex justify-center gap-[20px]  ' >

                {
                    props.ICall || CallStart ? 
                    <i className="fa-solid fa-video w-[55px] h-[55px] flex justify-center items-center    text-textWhite text-[20px] cursor-pointer bg-textGray  rounded-[50%]"     
                    ></i>
                    :null
                }

                
                <i className={`fa-solid fa-xmark  w-[55px] h-[55px] flex justify-center items-center text-textWhite text-[30px] cursor-pointer  bg-iconRed   rounded-[50%] transition-all `}   
                    onClick={closeVideoCall}
                ></i>

                {
                    !props.ICall &&  !CallStart ?
                    <i className="fa-solid fa-check   w-[55px] h-[55px] flex justify-center items-center text-textWhite text-[35px] cursor-pointer bg-textGreen  rounded-[50%]"
                        onClick={startCall}
                    ></i>:null
                }

                {
                    props.ICall || CallStart ?
                    <i className="fa-solid fa-microphone   w-[55px] h-[55px] flex justify-center items-center text-textWhite text-[20px] cursor-pointer bg-textGray  rounded-[50%]"
                    ></i>
                    :null
                }
               
            </div>
        </div>
    )

}

export default VideoCall