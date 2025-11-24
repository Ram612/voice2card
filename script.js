// Minimal, dependency-free frontend logic


let recorder = null;
let audioChunks = [];
let recordedBlob = null;
let selectedImageFile = null;


const recordBtn = document.getElementById('recordBtn');
const sendBtn = document.getElementById('sendBtn');
const downloadPNGBtn = document.getElementById('downloadPNGBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const imageInput = document.getElementById('imageInput');
const recordStatus = document.getElementById('recordStatus');


imageInput.addEventListener('change', (e) => {
selectedImageFile = e.target.files[0] || null;
if(selectedImageFile){
const url = URL.createObjectURL(selectedImageFile);
document.getElementById('profilePhoto').src = url;
}
});


recordBtn.addEventListener('click', async () => {
if(!recorder) await startRecording();
else stopRecording();
});


async function startRecording(){
try{
const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
recorder = new MediaRecorder(stream);
audioChunks = [];
recorder.ondataavailable = e => audioChunks.push(e.data);
recorder.onstop = () => {
recordedBlob = new Blob(audioChunks, { type: 'audio/webm' });
};
recorder.start();
recordBtn.innerText = '⏹ Stop';
recordStatus.innerText = 'Recording...';
}catch(err){
alert('Could not access microphone: ' + err.message);
}
}


function stopRecording(){
recorder.stop();
recorder = null;
recordBtn.innerText = '🎙️ Start Recording';
recordStatus.innerText = 'Idle';
}


sendBtn.addEventListener('click', async () => {
if(!recordedBlob){
alert('Please record your audio first.');
return;
}


const form = new FormData();
form.append('audio', recordedBlob, 'voice.webm');
if(selectedImageFile) form.append('image', selectedImageFile, selectedImageFile.name);


sendBtn.disabled = true;
sendBtn.innerText = '⏳ Generating...';


try{
const res = await fetch('/api/generate', { method: 'POST', body: form });
if(!res.ok) throw new Error('Server error ' + res.status);
const data = await res.json();


// Show transcription
document.getElementById('transcriptionText').innerText = data.transcription || '';
document.getElementById('transcriptionBox').hidden = false;


// Fill visiting card
const p = data.profile || {};
document.getElementById('cardName').innerText = p.name || '—';
document.getElementById('cardRole').innerText = p.role || '';
document.getElementById('cardCompany').innerText = p.company || '';


const emailEl = document.getElementById('cardEmail');
emailEl.innerText = p.email || '';
emailEl.href = p.email ? ('mailto:' + p.email) : '#';


document.getElementById('cardPhone').innerText = p.phone || '';
});
