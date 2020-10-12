const socket = io("/");

const videoGrid = document.getElementById("video-grid");

const peers = {};

// create video element to show self video
const myVideo = document.createElement("video");
// set self video as mute to avoid sound noise.
myVideo.muted = true;

// get media object from browser
// get both video and audio source
// this is promise with provde video stream
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    // send stream to video element and append to video grid on view.
    addVideoStream(myVideo, stream);

    // anwser to other user peer connection and send your stream to them
    // add them stream to our window to view other your stream
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // when new user connected to room occure this event
    // pass connected userID
    socket.on("user-connected", (userId) => {
      // send self video stream to another user
      connectToNewUser(userId, stream);
    });
  })
  .catch((error) => {
    alert(error);
    console.log(error);
  });

socket.on("user-disconnect", (userId) => {
  if (peers[userId]) peers[userId].close();
});
// connect to peer server which is use for create new user id
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

// send new user id to when your conneted to room send
// current your id
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

// add video stream to video elements
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  // my peer send our video to other and send back other to you
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");

  // get other your stream add them to new video element
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  // on close from other side then remove video element.
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}
