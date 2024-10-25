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

// PeerJS setup
const peer = new Peer(undefined, {
  host: 'peerjs-server.herokuapp.com',
  secure: true,
  port: 443,
});

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

let myStream;

// Access user's video and audio stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
  myStream = stream;
  addVideoStream(myVideo, stream);

  // Handle incoming calls
  peer.on('call', (call) => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => addVideoStream(video, userVideoStream));
  });

  // Initialize room and user management in Firebase
  peer.on('open', (id) => {
    const roomId = "test-room";  // Static room ID for testing
    const userRef = database.ref(`${roomId}/${id}`);
    userRef.set(id);

    // Remove user from Firebase on disconnect
    userRef.onDisconnect().remove();

    // Listen for new users in the room
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
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => addVideoStream(video, userVideoStream));
}

// Add a video stream to the video grid
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  videoGrid.append(video);
}

// Firebase and PeerJS setup as before...

// Toggle audio on and off with reliable functionality
function toggleAudio() {
  const audioTrack = myStream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    document.getElementById('toggleAudio').textContent = audioTrack.enabled ? 'Mute Audio' : 'Unmute Audio';
  }
}

// Toggle video on and off with reliable functionality
function toggleVideo() {
  const videoTrack = myStream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    document.getElementById('toggleVideo').textContent = videoTrack.enabled ? 'Mute Video' : 'Unmute Video';
  }
}

// Function to handle adding video stream
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => video.play());
  videoGrid.append(video);
}

// Ensure media devices are correctly initialized
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((stream) => {
    myStream = stream;
    addVideoStream(myVideo, stream);
    setupPeerConnections();
  })
  .catch((error) => console.error('Error accessing media devices:', error));

// Function to set up peer connections, calling, and room management...
// This will include Firebase room setup and peer connection as in the previous example.


// Share invite link
function shareInviteLink() {
  const roomId = "test-room";  // Static room ID (can be made dynamic)
  const inviteLink = `${window.location.origin}?room=${roomId}`;
  navigator.clipboard.writeText(inviteLink).then(() => {
    alert('Invite link copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy invite link.');
  });
}
