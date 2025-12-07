
/* ========== Init AOS and page basics ========== */
AOS.init({duration:900, once:true});
document.getElementById('year').textContent = new Date().getFullYear();

/* ========== Loading overlay ========== */
window.addEventListener('load', ()=> {
  const L = document.getElementById('loading');
  L.style.opacity = 0;
  setTimeout(()=>L.style.display='none', 500);
});

/* ========== Theme toggle ========== */
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', ()=> {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme') || 'dark';
  if(current === 'dark'){ root.setAttribute('data-theme','light'); themeToggle.textContent='🌞' }
  else { root.setAttribute('data-theme','dark'); themeToggle.textContent='🌙' }
});

/* ========== Matrix rain (toggle) ========== */
const matrixToggle = document.getElementById('matrixToggle');
const matrixCanvas = document.getElementById('matrix');
let matrixEnabled = false;
matrixToggle.addEventListener('click', ()=> {
  matrixEnabled = !matrixEnabled;
  if(matrixEnabled) startMatrix(); else stopMatrix();
});

let matrixCtx, matrixInterval;
function startMatrix(){
  matrixCanvas.width = innerWidth; matrixCanvas.height = innerHeight;
  matrixCtx = matrixCanvas.getContext('2d');
  const cols = Math.floor(matrixCanvas.width/14);
  const y = Array(cols).fill(0);
  function draw(){
    matrixCtx.fillStyle = 'rgba(0,0,0,0.05)';
    matrixCtx.fillRect(0,0,matrixCanvas.width,matrixCanvas.height);
    matrixCtx.fillStyle = 'rgba(46,196,255,0.6)';
    matrixCtx.font = '14px monospace';
    for(let i=0;i<y.length;i++){
      const text = String.fromCharCode(0x30A0 + Math.random()*96);
      matrixCtx.fillText(text, i*14, y[i]*14);
      if(y[i]*14 > matrixCanvas.height && Math.random()>0.975) y[i]=0;
      y[i]++;
    }
  }
  matrixInterval = setInterval(draw, 50);
  matrixCanvas.style.display='block';
}
function stopMatrix(){ clearInterval(matrixInterval); matrixCanvas.style.display='none' }

/* ========== Particle system for hero + cursor trails ========== */
const pc = document.getElementById('particleCanvas');
pc.width = innerWidth; pc.height = innerHeight;
const pctx = pc.getContext('2d');
let particles = [];
function random(min,max){return Math.random()*(max-min)+min}
for(let i=0;i<60;i++) particles.push({x:random(0,pc.width),y:random(0,pc.height),vx:random(-0.2,0.2),vy:random(-0.2,0.2),size:random(0.6,2.2),life:random(100,400)});
function drawParticles(){
  pctx.clearRect(0,0,pc.width,pc.height);
  particles.forEach(p=>{
    p.x += p.vx; p.y += p.vy; p.life--;
    if(p.x<0||p.x>pc.width) p.vx *= -1;
    if(p.y<0||p.y>pc.height) p.vy *= -1;
    if(p.life<=0){ p.x=random(0,pc.width); p.y=random(0,pc.height); p.life=random(100,400) }
    pctx.beginPath(); pctx.fillStyle = 'rgba(46,196,255,0.06)'; pctx.arc(p.x,p.y,p.size,0,Math.PI*2); pctx.fill();
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();
window.addEventListener('resize', ()=>{pc.width=innerWidth; pc.height=innerHeight;});

/* ========== Cursor + trailing light ========== */
const cursor = document.getElementById('cursor');
let trail = [], trailMax = 20;
window.addEventListener('mousemove', (e)=> {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  trail.push({x:e.clientX,y:e.clientY,life:40});
  if(trail.length>trailMax) trail.shift();
});
function drawTrail(){
  const ctx = pctx;
  trail.forEach(t=>{
    ctx.beginPath();
    ctx.fillStyle = 'rgba(46,196,255,0.08)';
    ctx.arc(t.x, t.y, 8, 0, Math.PI*2);
    ctx.fill();
    t.life -= 1;
  });
  trail = trail.filter(t=>t.life>0);
  requestAnimationFrame(drawTrail);
}
drawTrail();

/* ========== Portrait 3D tilt + parallax layers move ========== */
const portraitWrap = document.querySelector('.portrait-wrap');
const portraitCard = document.querySelector('.portrait-card');
const parallaxLayers = document.querySelectorAll('.parallax .layer');
portraitWrap.addEventListener('mousemove', (e)=>{
  const r = portraitWrap.getBoundingClientRect();
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;
  const dx = (e.clientX - cx);
  const dy = (e.clientY - cy);
  portraitCard.style.transform = `rotateY(${dx*0.02}deg) rotateX(${-dy*0.02}deg) translateZ(6px)`;
  parallaxLayers.forEach((L,i)=>{
    const factor = (i+1)*0.01;
    L.style.transform = `translate3d(${dx*factor}px,${dy*factor}px,0)`;
  });
});
portraitWrap.addEventListener('mouseleave', ()=> {
  portraitCard.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)';
  parallaxLayers.forEach(L=>L.style.transform='translate3d(0,0,0)');
});

/* ========== Language wheel (3D-ish) ========== */
const techs = ['HTML','CSS','JS','Python','SQL','Flutter','Node'];
const wheel = document.getElementById('langWheel');
techs.forEach((t,i)=>{
  const el = document.createElement('div');
  el.className = 'item';
  el.textContent = t;
  const angle = (i/techs.length) * Math.PI*2;
  const r = 90;
  el.style.left = (50 + Math.cos(angle)*r/2) + '%';
  el.style.top = (50 + Math.sin(angle)*r/2) + '%';
  el.style.transform = `translate(-50%,-50%) rotate(${i*20}deg)`;
  el.style.position='absolute';
  wheel.appendChild(el);
});

/* ========== Counters animation (intersection) ========== */
const counters = [{id:'c1',to:12},{id:'c2',to:340},{id:'c3',to:7800}];
const runCounters = ()=> {
  counters.forEach(c=>{
    const el = document.getElementById(c.id);
    let v=0; const step = Math.max(1, Math.round(c.to/120));
    const iv = setInterval(()=>{ v += step; if(v>=c.to){ el.textContent = c.to; clearInterval(iv);} else el.textContent = v; }, 14);
  });
};
const obs = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){ runCounters(); obs.disconnect(); }
  });
},{threshold:.4});
obs.observe(document.querySelector('.counters'));

/* ========== Video preview on hover: play/pause ========== */
document.querySelectorAll('.card-vid video').forEach(v=>{
  v.parentElement.addEventListener('mouseenter', ()=>{ v.play(); });
  v.parentElement.addEventListener('mouseleave', ()=>{ v.pause(); v.currentTime = 0; });
});

/* ========== AI Chat mock (local) ========== */
const aiChat = document.getElementById('aiChat');
const aiInput = document.getElementById('aiInput');
const aiSend = document.getElementById('aiSend');
aiSend.addEventListener('click', sendAi);
aiInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendAi(); });
function sendAi(){
  const q = aiInput.value.trim(); if(!q) return;
  appendMsg('You', q);
  aiInput.value='';
  appendMsg('AI', '...thinking');
  // simulate response
  setTimeout(async ()=>{
    aiChat.lastChild.remove(); // remove thinking
    const answer = await getAiReply(q);
    appendMsg('AI', answer);
  }, 800 + Math.random()*600);
}
function appendMsg(user, text){
  const div = document.createElement('div'); div.style.marginBottom='8px';
  div.innerHTML = `<strong style="display:block;color:var(--accent1)">${user}</strong><div style="margin-top:6px">${text}</div>`;
  aiChat.appendChild(div); aiChat.scrollTop = aiChat.scrollHeight;
}
async function getAiReply(q){
  // Mock logic — replace with API call if you want (OpenAI etc.)
  q = q.toLowerCase();
  if(q.includes('cv')) return 'You can download my CV from the Download CV button at the top.';
  if(q.includes('projects')) return 'I built a university club system using Oracle PL/SQL, a C++ flight reservation system, and an AI content pipeline.';
  if(q.includes('skills') || q.includes('stack')) return 'I work with HTML/CSS, JavaScript/Node, Python for AI, Oracle PL/SQL and Flutter.';
  return "That's interesting — I'd be happy to chat further. Email me at abdimekonin123@gmail.com (demo reply).";
}

/* ========== Testimonials simple slider (auto) ========== */
let tIdx=0;
setInterval(()=> {
  const cards = document.querySelectorAll('.test-card');
  if(!cards.length) return;
  cards.forEach((c,i)=> c.style.transform = `translateY(${(i - (tIdx%cards.length))*6}%)`);
  tIdx++;
}, 4000);

/* ========== Animated logo spin on hover ========== */
document.querySelector('.logo-am').addEventListener('mouseenter', ()=> { document.querySelector('.logo-am').style.transform='rotate(12deg) scale(1.05)';});
document.querySelector('.logo-am').addEventListener('mouseleave', ()=> { document.querySelector('.logo-am').style.transform='rotate(0deg) scale(1)';});

/* ========== Project details modal (not implemented as modal objects, but you can add) ========== */
/* ========== Smooth anchor highlight: highlight nav on scroll ========== */
const sections = document.querySelectorAll('main section');
const navLinks = document.querySelectorAll('header nav a');
const sectionObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      navLinks.forEach(a=> a.classList.remove('active'));
      const link = document.querySelector(`header nav a[href="#${e.target.id}"]`);
      if(link) link.classList.add('active');
    }
  });
},{threshold:0.35});
sections.forEach(s=>sectionObserver.observe(s));

/* ========== Reduced motion fallback ========== */
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.querySelectorAll('[data-aos]').forEach(el=>el.removeAttribute('data-aos'));
  // stop heavy animations: stop spin etc.
  document.querySelectorAll('.wheel').forEach(w=>w.style.animation='none');
}

/* ========== Resize handlers ========== */
window.addEventListener('resize', ()=> {
  pc.width = innerWidth; pc.height = innerHeight;
  matrixCanvas.width = innerWidth; matrixCanvas.height = innerHeight;
});

/* ========== Lazy load videos poster -> play on hover handled above; implement small performance tweaks ========== */
// You can add IntersectionObserver to lazy load heavy resources if needed.
const texts = ["Software Developer", "AI Enthusiast", "Tech Creator"]; // Add more texts if you want
let currentText = 0;
let charIndex = 0;
let typing = true;
const typewriterEl = document.getElementById("typewriter");

function typeWriter() {
    if (typing) {
        if (charIndex < texts[currentText].length) {
            typewriterEl.textContent += texts[currentText].charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 150); // typing speed
        } else {
            typing = false;
            setTimeout(typeWriter, 1000); // pause before deleting
        }
    } else {
        if (charIndex > 0) {
            typewriterEl.textContent = texts[currentText].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(typeWriter, 100); // deleting speed
        } else {
            typing = true;
            currentText = (currentText + 1) % texts.length; // next text
            setTimeout(typeWriter, 500); // pause before typing next
        }
    }
}

// Start the typewriter
typeWriter();
