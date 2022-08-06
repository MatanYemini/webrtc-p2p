let localStream;
let remoteStream;
let peerConnection;

// STUN servers
const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  document.getElementById("user-1").srcObject = localStream;
};

let createOffer = async () => {
  // The peer connection gets the servers he needs to communicate with in order to generate our ice candidates
  peerConnection = new RTCPeerConnection(configuration); // source of truth for this connection
  remoteStream = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStream;

  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  document.getElementById("offer-sdp").value = JSON.stringify(offer);
};

init();

document.getElementById("create-offer").onclick = createOffer;
