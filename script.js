// Highlighted: Set up PeerJS instance
const peer = new Peer(undefined, {
  host: 'peerjs-server.herokuapp.com',  // Public PeerJS server
  secure: true,
  port: 443,
});

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

// Access user's video and audio stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
  addVideoStream(myVideo, stream);

  // Answer incoming call and add user's video to the grid
  peer.on('call', (call) => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => addVideoStream(video, userVideoStream));
  });

  // Connect to new users when someone else joins
  peer.on('open', (id) => {
    joinRoom(id);
  });
});

// Connect and call new users
function joinRoom(peerId) {
  // Broadcast connection to other users via PeerJS signaling server
  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
  });
}

// Highlighted: Call a new user with PeerJS
function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => addVideoStream(video, userVideoStream));
}

// Add a video stream to the HTML video grid
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  videoGrid.append(video);
}

