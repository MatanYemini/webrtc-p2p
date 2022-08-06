/** @type {MediaStream} */
let localStream;

/** @type {MediaStream} */
let remoteStream;

/** @type {RTCPeerConnection} */
let peerConnection;

// STUN servers
const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

const init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  document.getElementById("user-1").srcObject = localStream;
};

const createOffer = async () => {
  await createPeerConnection("offer-sdp");

  // after offer is created - request for stun servers will be emitted
  // after the request is made, our ice candidates are being created

  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  document.getElementById("offer-sdp").value = JSON.stringify(offer);
};

const createAnswer = async () => {
  await createPeerConnection("answer-sdp");

  let offer = document.getElementById("offer-sdp").value;

  if (!offer) {
    return alert("Receive offer from peer before!");
  }

  offer = JSON.parse(offer);
  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  document.getElementById("answer-sdp").value = JSON.stringify(answer);
};

const addAnswer = async () => {
  let answer = document.getElementById("answer-sdp").value;
  if (!answer) {
    return alert("Retrieve answer from peer failed");
  }
  answer = JSON.parse(answer);

  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
};

const createPeerConnection = async (sdpType) => {
  peerConnection = new RTCPeerConnection(configuration); // source of truth for this connection
  remoteStream = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  // will be called each time we have ice candidate created
  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      // Each time we get a new candidate, the offer will be updated
      document.getElementById(sdpType).value = JSON.stringify(
        peerConnection.localDescription
      );
    }
  };
};

init();

document.getElementById("create-offer").onclick = createOffer;
document.getElementById("create-answer").onclick = createAnswer;
document.getElementById("add-answer").onclick = addAnswer;
