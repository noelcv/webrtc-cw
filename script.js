const socket = io('/'); //it will connect to root path - but in the real project it can be added straight to our /safespace;
//create new Peer to our own server - firstParam is an undefinedID the server will create a unique Id
const videoGrid = document.getElementById('video-grid');

const myPeer = new Peer(undefined, {
  secure: true,
  host: '0.peerjs.com',
  port: '443',
});


const myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false
}).then(stream => {
  addVideoStream(myVideo, stream);
  
  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    })
  })
  
  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
  });
});

socket.on('user-disconnected', userId => {
  if(peers[userId]) peers[userId].close(); // close only if connection exists;
})

//as soon as we connect run the code inside
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
})


const connectToNewUser = (userId, stream) => {
  //first we call
  const call = myPeer.call(userId, stream);
  
  let video = document.createElement('video');
  //and then when we receive their stream we populate video with the videostream
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream); 
  })
  call.on('close', () => {
    video.remove();
  })
  
  peers[userId] = call;
};


const addVideoStream = (video,stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
  console.log('new video appended', video);
};