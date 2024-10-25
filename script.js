// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSvfmiF6nIygl0v9fSW7wkA6dODyv2CRs",
  authDomain: "database-5859f.firebaseapp.com",
  projectId: "database-5859f",
  storageBucket: "database-5859f.appspot.com",
  messagingSenderId: "1042075089744",
  appId: "1:1042075089744:web:1fdca4d06e02238dc00a55",
  measurementId: "G-BW58H74H6R"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Initialize PeerJS
const peer = new Peer(undefined, {
  host: 'peerjs-server.herokuapp.com',
  secure: true,
  port: 443,
});

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;  // Mute your own video

// Access user's video and audio stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
  addVideoStream(myVideo, stream);

  // Handle incoming calls from other users
  peer.on('call', (call) => {
    call.answer(stream);  // Answer the call with our stream
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => addVideoStream(video, userVideoStream));
  });

  // Open connection to Firebase once PeerJS ID is ready
  peer.on('open', (id) => {
    const roomId = "test-room";  // Static room ID (can be dynamic)
    const userRef = database.ref(`${roomId}/${id}`);
    userRef.set(id);

    // Remove user from Firebase on disconnect
    userRef.onDisconnect().remove();

    // Listen for new users in the room and connect
    database.ref(roomId).on('value', (snapshot) => {
      const users = snapshot.val();
      Object.keys(users).forEach((userId) => {
        if (userId !== id) connectToNewUser(userId, stream);
      });
    });
  });
});

// Connect to a new user by calling them
function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);  // Initiate call with new user
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => addVideoStream(video, userVideoStream));
}

// Add a video stream to the video grid
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  videoGrid.append(video);
}
