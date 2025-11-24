// Client-only Voice → Visiting Card

// Elements
const startRec = document.getElementById('startRec');
const stopRec = document.getElementById('stopRec');
const recStatus = document.getElementById('recStatus');
const manualText = document.getElementById('manualText');
const extractBtn = document.getElementById('extractBtn');
const imageInput = document.getElementById('imageInput');
const photoImg = document.getElementById('photoImg');

const downloadPNGBtn = document.getElementById('downloadPNGBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');

const v_name = document.getElementById('v_name');
const v_role = document.getElementById('v_role');
const v_tagline = document.getElementById('v_tagline');
const v_email = document.getElementById('v_email');
const v_phone = document.getElementById('v_phone');
const v_link = document.getElementById('v_link');
const v_web = document.getElementById('v_web');
const v_skills = document.getElementById('v_skills');

let recognition = null;
let transcriptText = '';

// Setup Web Speech API
if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => { recStatus.innerText = 'Listening...'; };
  recognition.onerror = (e) => { recStatus.innerText = 'Error: ' + e.error; };
  recognition.onend = () => { recStatus.innerText = 'Stopped'; stopRec.disabled = true; startRec.disabled = false; };

  recognition.onresult = (event) => {
    let interim = '';
    for(let i = event.resultIndex; i < event.results.length; ++i){
      const res = event.results[i];
      if(res.isFinal) transcriptText += res[0].transcript + ' ';
      else interim += res[0].transcript;
    }
    manualText.value = transcriptText + interim;
  };
} else {
  recStatus.innerText = 'Web Speech API not supported in this browser.';
  startRec.disabled = true;
}

startRec.addEventListener('click', () => {
  if(!recognition) return alert('Speech API not supported. Please paste transcript manually.');
  transcriptText = '';
  manualText.value = '';
  recognition.start();
  startRec.disabled = true; stopRec.disabled = false;
});

stopRec.addEventListener('click', () => {
  if(recognition) recognition.stop();
});

// Image preview
imageInput.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if(!f) return;
  const url = URL.createObjectURL(f);
  photoImg.src = url;
});

// Extraction heuristics
function extractProfile(text){
  const t = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  // Email
  const emailMatch = t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // Phone (simple patterns for international/local)
  const phoneMatch = t.match(/(\+?\d{1,3}[\s-]?)?(\d[\d\s-]{6,}\d)/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // LinkedIn (handle full URL or @handle)
  const lnMatch = t.match(/(https?:\/\/)?(www\.)?linkedin\.com\/[A-Za-z0-9\-_/]+|linkedin\.?com\/[A-Za-z0-9\-_/]+|@([A-Za-z0-9\-_.]+)/i);
  const linkedin = lnMatch ? (lnMatch[0].startsWith('http') ? lnMatch[0] : ('https://'+lnMatch[0])) : '';

  // Website
  const webMatch = t.match(/https?:\/\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+/i);
  const website = webMatch ? webMatch[0] : '';

  // Name & role heuristics: look for patterns like "I'm NAME" or "I am NAME"
  let name = '';
  const imMatch = t.match(/(?:I\'m|I am|This is)\s+([A-Z][A-Za-z\-]+(?:\s+[A-Z][A-Za-z\-]+){0,2})/i);
  if(imMatch) name = imMatch[1];

  // Also try first phrase (before comma) as fallback
  if(!name){
    const firstPhrase = t.split(/[.,;\n]/)[0];
    const words = firstPhrase.split(' ').filter(Boolean);
    if(words.length<=3 && words.every(w=>/^[A-Z]/.test(w))) name = firstPhrase.trim();
  }

  // role and company: look for "Role at Company" or "Role, Company"
  let role = '';
  let company = '';
  const roleAtMatch = t.match(/([A-Za-z ]{2,40})\s+(?:at|@)\s+([A-Za-z0-9 &\-]{2,40})/i);
  if(roleAtMatch){ role = roleAtMatch[1].trim(); company = roleAtMatch[2].trim(); }
  else{
    const parts = t.split(/\.|,|;|\n/).map(s=>s.trim()).filter(Boolean);
    for(const p of parts){
      if(/at\s+\w+/i.test(p)){
        const m = p.match(/(.{1,40})\s+at\s+(.{1,40})/i);
        if(m){ role = m[1].trim(); company = m[2].trim(); break; }
      }
    }
  }

  // Tagline
  let tagline = '';
  const tagMatch = t.match(/(?:speciali[sz]e|expert|focus|building|helping)[^\.\n]{0,80}/i);
  if(tagMatch) tagline = tagMatch[0].trim();
  else tagline = t.split(/[.\n]/)[0].slice(0,120).trim();

  // Skills
  let skills = [];
  const skillsMatch = t.match(/(?:skills|technologies|stack|speciali[sz]e in)[:\s]+([A-Za-z0-9,\/ &]+)(?:\.|$)/i);
  if(skillsMatch){
    skills = skillsMatch[1].split(/[\/,]/).map(s=>s.trim()).filter(Boolean);
  } else {
    const common = ['React','Django','Python','Node','AWS','Azure','GCP','Odoo','AI','ML','Docker','Kubernetes','Next.js','TypeScript','JavaScript'];
    for(const c of common){ if(new RegExp('\\b'+c+'\\b','i').test(t)) skills.push(c); }
  }

  // If role still empty, try picking 2-4 words after name
  if(!role && name){
    const afterName = t.split(name)[1] || '';
    const maybe = afterName.trim().split(/[.,;\n]/)[0];
    if(!/\b(at|from|is|,|-)\b/i.test(maybe)) role = maybe.split(' ').slice(0,4).join(' ').trim();
  }

  return {
    name: name || '',
    role: role || '',
    company: company || '',
    email, phone, website, linkedin,
    skills: skills.slice(0,10),
    tagline: tagline || ''
  };
}

// Fill visiting card
function fillCard(profile){
  v_name.innerText = profile.name || '—';
  v_role.innerText = ((profile.role || '') + (profile.company ? ' • ' + profile.company : '')).trim();
  v_tagline.innerText = profile.tagline || '';
  v_email.innerText = profile.email || '';
  v_email.href = profile.email ? 'mailto:'+profile.email : '#';
  v_phone.innerText = profile.phone || '';
  v_link.innerText = profile.linkedin || '';
  v_link.href = profile.linkedin || '#';
  v_web.innerText = profile.website || '';
  v_web.href = profile.website || '#';
  v_skills.innerHTML = '';
  (profile.skills || []).forEach(s => {
    const sp = document.createElement('span'); sp.innerText = s; v_skills.appendChild(sp);
  });
}

// Hook extract button
extractBtn.addEventListener('click', () => {
  const text = manualText.value.trim();
  if(!text) return alert('Please record or paste your transcription first.');
  const profile = extractProfile(text);
  fillCard(profile);
});

// Downloads
async function downloadPNG(){
  const el = document.getElementById('visitingCard');
  const canvas = await html2canvas(el, { scale: 2 });
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a'); a.href = dataUrl; a.download = 'visiting-card.png'; a.click();
}

async function downloadPDF(){
  const el = document.getElementById('visitingCard');
  const canvas = await html2canvas(el, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({orientation:'landscape', unit:'px', format:[canvas.width, canvas.height]});
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save('visiting-card.pdf');
}

downloadPNGBtn.addEventListener('click', downloadPNG);
downloadPDFBtn.addEventListener('click', downloadPDF);

// Placeholder image
photoImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect fill="%23eef2ff" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="20">Profile</text></svg>';
