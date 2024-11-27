var socket = io()
var room 
var pc
var pcConfig = turnConfig
var remoteStream
var localStream
var sample = ''
var isStarted
function startCall () {
  room = prompt("enter room Id")
  socket.emit('create room',room)
  navigator.mediaDevices.getUserMedia({video:true,audio:true}).then(gotStream)
}

function gotStream(stream) {
  const localVideo = document.querySelector('#localVideo')  
  localStream = stream
  
  localVideo.srcObject = localStream
  sendMessage('got user media', room)
}



socket.on('join',(room)=>{
  pc.addStream(localStream)
  doCall()
})

socket.on('created',(room)=>{
})

socket.on('joined',(room)=>{
 
})
socket.on('ans',(room)=>{
})



socket.on('message',(message)=>{
  if (message.type === 'offer') {

    pc.setRemoteDescription(new RTCSessionDescription(message));
    console.log('offer /////',message)
    createPeerConnection()
    doAnswer()
  } else if (message.type === 'answer' && isStarted) {
   // alert('answer')
    pc.setRemoteDescription(new RTCSessionDescription(message))
  } else if(message.type === 'candidate') {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    
    pc.addIceCandidate(candidate);

    // pc.oniceconnectionstatechange = function() { console.log('ICE connection state:', pc.iceConnectionState); };
  } 
})

function sendMessage(message, room) {
   console.log('Client sending message: ', message, room);
  socket.emit('message', message, room);
}

function createPeerConnection() {
  try {
  
  pc = new RTCPeerConnection(pcConfig)
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
     isStarted = true
    console.log('Created RTCPeerConnnection');
  } catch (error) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }

}
function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  const remoteVideo = document.querySelector('#remoteVideo')
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
console.log('Remote stream removed. Event: ', event);
}

function handleIceCandidate(event) {
  // console.log('icecandidate event: ', event.candidate);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    }, room);
  } else {
    console.log('End of candidates.');
  }
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError)
}

function setLocalAndSendMessage(sessionDescription) {
  console.log('local Stream///////////////////',localStream)
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription, room);
}


function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}
function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  )
}

