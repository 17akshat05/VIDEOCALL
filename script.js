const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.getElementById('my-video');

let myStream;
let peers = {};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
}).then((stream) => {
  myStream = stream;
  myVideo.srcObject = stream;

  socket.emit('join-room', ROOM_ID, USER_ID);

  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
  });

  socket.on('user-disconnected', (userId) => {
    if (peers[userId]) peers[userId].close();
  });
});

function connectToNewUser(userId, stream) {
  const peer = new RTCPeerConnection();
  
  peer.ontrack = (event) => {
    const video = document.createElement('video');
    video.srcObject = event.streams[0];
    videoGrid.append(video);
    video.play();
  };

  stream.getTracks().forEach((track) => peer.addTrack(track, stream));
  peers[userId] = peer;
}
