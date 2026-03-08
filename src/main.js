import './style.css';

// Initialize Icons
lucide.createIcons();

// Particle Background
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }
    draw() {
        ctx.fillStyle = `rgba(147, 197, 253, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 50; i++) particles.push(new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                ctx.strokeStyle = `rgba(147, 197, 253, ${0.1 * (1 - distance / 150)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        });
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Utility Functions
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function toggleCode(id) {
    const el = document.getElementById(id + '-code');
    el.classList.toggle('hidden');
}

// Oracle Logic
const oracleCards = [
    { icon: '🌙', meaning: 'Refactor', msg: 'Time to clean up those functions.' },
    { icon: '☀️', meaning: 'Deploy', msg: 'Production awaits. Ship it.' },
    { icon: '⚡', meaning: 'Optimize', msg: 'That query is slowing you down.' }
];

function oracleDraw() {
    document.getElementById('card-pile').style.transform = 'scale(0.9) rotateY(180deg)';
    document.getElementById('card-pile').style.opacity = '0';
    setTimeout(() => {
        const card = oracleCards[Math.floor(Math.random() * oracleCards.length)];
        document.querySelector('#drawn-card span:first-child').textContent = card.icon;
        document.getElementById('card-meaning').textContent = card.meaning;
        document.getElementById('oracle-text').textContent = card.msg;
        document.getElementById('drawn-card').classList.remove('opacity-0', 'scale-0');
        document.getElementById('drawn-card').classList.add('opacity-100', 'scale-100');
        document.getElementById('oracle-result').classList.remove('hidden');
    }, 300);
}

function oracleReset() {
    document.getElementById('card-pile').style.transform = 'scale(1) rotateY(0)';
    document.getElementById('card-pile').style.opacity = '1';
    document.getElementById('drawn-card').classList.add('opacity-0', 'scale-0');
    document.getElementById('oracle-result').classList.add('hidden');
}

// Kanban Logic
function allowDrop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.add('drag-over');
}

function leaveDrop(ev) {
    ev.currentTarget.classList.remove('drag-over');
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.style.opacity = '0.5';
}

function drop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    const data = ev.dataTransfer.getData("text");
    const el = document.getElementById(data);
    el.style.opacity = '1';
    ev.currentTarget.querySelector('.space-y-2').appendChild(el);
}

// Editor Logic
function updateEditor(textarea) {
    const out = document.getElementById('editor-output');
    const val = textarea.value;
    if (val.includes('console.log')) {
        const match = val.match(/console\.log\(['"](.+?)['"]\)/);
        out.innerHTML = match ? `> ${match[1]}<br>> undefined` : '> undefined';
    }
}

// Chart Logic
function randomizeChart() {
    document.querySelectorAll('.chart-bar').forEach(bar => {
        const h = Math.floor(Math.random() * 80) + 20;
        bar.style.height = h + '%';
    });
}

function updateChart(bar) {
    const h = Math.floor(Math.random() * 90) + 10;
    bar.style.height = h + '%';
}

// Command Logic
function filterCommands(query) {
    // Simple filter demo
}

function execCommand(cmd) {
    if (cmd === 'theme') document.documentElement.classList.toggle('dark');
    if (cmd === 'contact') scrollToSection('contact');
}

// Password Logic
function checkStrength(pass) {
    let score = 0;
    if (pass.length > 8) score++;
    if (pass.match(/[A-Z]/)) score++;
    if (pass.match(/[0-9]/)) score++;
    if (pass.match(/[^A-Za-z0-9]/)) score++;

    const bar = document.getElementById('strength-bar');
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    bar.className = `h-full transition-all duration-500 ${colors[score] || 'bg-red-500'}`;
    bar.style.width = ((score + 1) * 25) + '%';

    const texts = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    document.getElementById('strength-text').textContent = texts[score];
    document.getElementById('strength-text').className = score > 2 ? 'text-green-400' : 'text-red-400';
}

// Slider Logic
function slideCompare(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    document.getElementById('after-layer').style.width = pct + '%';
    document.getElementById('slider-handle').style.left = pct + '%';
}

// Copy Code
function copyCode(btn) {
    const code = btn.closest('.glass-panel').querySelector('code').textContent;
    navigator.clipboard.writeText(code);
    btn.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-green-400"></i>';
    lucide.createIcons();
    setTimeout(() => {
        btn.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i>';
        lucide.createIcons();
    }, 2000);
}

// Form Submit
async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');

    // Simulate loading state
    btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> <span>Sending...</span>';
    btn.disabled = true;
    btn.classList.add('opacity-80', 'cursor-not-allowed');
    lucide.createIcons();

    // Simulated network delay (Replace with real fetch to Formspree/Web3Forms)
    // const formData = new FormData(form);
    // await fetch('YOUR_FORM_ENDPOINT', { method: 'POST', body: formData });
    await new Promise(resolve => setTimeout(resolve, 1500));

    form.style.display = 'none';
    document.getElementById('success-msg').classList.remove('hidden');
}

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('#labs input[placeholder*="command"]').focus();
    }
});

// --- 3D Tilt Effect for Project Cards ---
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        const glow = card.querySelector('.tilt-glow');
        if (glow) {
            glow.style.transform = `translateZ(1px)`;
            glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)`;
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        const glow = card.querySelector('.tilt-glow');
        if (glow) {
            glow.style.background = `transparent`;
        }
    });
});

// Attach functions to window so inline event handlers work
window.scrollToSection = scrollToSection;
window.toggleCode = toggleCode;
window.oracleDraw = oracleDraw;
window.oracleReset = oracleReset;
window.allowDrop = allowDrop;
window.leaveDrop = leaveDrop;
window.drag = drag;
window.drop = drop;
window.updateEditor = updateEditor;
window.randomizeChart = randomizeChart;
window.updateChart = updateChart;
window.filterCommands = filterCommands;
window.execCommand = execCommand;
window.checkStrength = checkStrength;
window.slideCompare = slideCompare;
window.copyCode = copyCode;
window.handleSubmit = handleSubmit;


// Typewriter Effect Logic
const words = ["websites", "web apps", "software", "experiences"];
let i = 0;
let timer;

function typeWriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    let word = words[i].split('');
    let isDeleting = false;
    let text = '';
    let waitTime = 1500;

    function loop() {
        if (!isDeleting && word.length > 0) {
            text += word.shift();
            el.innerHTML = text;
            timer = setTimeout(loop, 100);
        } else if (isDeleting && text.length > 0) {
            text = text.slice(0, -1);
            el.innerHTML = text;
            timer = setTimeout(loop, 50);
        } else if (text.length === 0) {
            isDeleting = false;
            i = (i + 1) % words.length;
            word = words[i].split('');
            timer = setTimeout(loop, 500); // pause before typing new word
        } else {
            isDeleting = true;
            timer = setTimeout(loop, waitTime); // pause before deleting
        }
    }

    loop();
}

// Start typewriter when DOM loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', typeWriter);
} else {
    typeWriter();
}

// --- Quote Form Logic ---
let quoteCurrentStep = 1;
const quoteTotalSteps = 4;
let quoteFormData = {};

document.querySelectorAll('.quote-option-card').forEach(card => {
    card.addEventListener('click', function () {
        document.querySelectorAll('.quote-option-card').forEach(c => c.classList.remove('border-blue-500', 'bg-blue-500/10'));
        this.classList.add('border-blue-500', 'bg-blue-500/10');
        document.querySelector('[name="project_type"]').value = this.dataset.value;
    });
});

document.getElementById('qbtn-next')?.addEventListener('click', nextQuoteStep);
document.getElementById('qbtn-prev')?.addEventListener('click', prevQuoteStep);

function validateQuoteStep(step) {
    const stepElement = document.getElementById(`qstp-${step}`);
    if (!stepElement) return false;

    if (step === 1) {
        const projectType = document.querySelector('[name="project_type"]').value;
        if (!projectType) { alert('Please select a project type'); return false; }
    }
    const requiredFields = stepElement.querySelectorAll('[required]');
    let valid = true;
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            valid = false; field.classList.add('border-red-500');
            setTimeout(() => field.classList.remove('border-red-500'), 3000);
        }
    });
    if (!valid) alert('Please fill all required fields');
    return valid;
}

function collectQuoteData() {
    const form = document.getElementById('quote-form-home');
    const formDataObj = new FormData(form);
    const features = [];
    form.querySelectorAll('input[name="features"]:checked').forEach(cb => features.push(cb.value));
    quoteFormData = {
        project_type: formDataObj.get('project_type'),
        project_goal: formDataObj.get('project_goal'),
        features: features.join(', '),
        timeline: formDataObj.get('timeline'),
        budget_range: formDataObj.get('budget_range'),
        nombre_cliente: formDataObj.get('nombre_cliente'),
        email_cliente: formDataObj.get('email_cliente'),
        empresa: formDataObj.get('empresa'),
        telefono: formDataObj.get('telefono'),
        notas_adicionales: formDataObj.get('notas_adicionales'),
        idioma: 'en',
        status: 'nueva_cotizacion'
    };
}

async function submitQuoteForm() {
    collectQuoteData();
    const btnNext = document.getElementById('qbtn-next');
    btnNext.innerHTML = '<span>Sending...</span>';
    btnNext.disabled = true;
    try {
        const response = await fetch('/api/save-quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quoteFormData)
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById(`qstp-${quoteCurrentStep}`).classList.add('hidden');
            document.getElementById('qstp-5').classList.remove('hidden');
            document.getElementById('quote-nav').classList.add('hidden');
        } else throw new Error(result.error);
    } catch (error) {
        alert('Error submitting. Try again.');
        btnNext.innerHTML = '<span>Submit Request</span><i data-lucide="send" class="w-4 h-4 inline ml-2"></i>';
        btnNext.disabled = false;
        lucide.createIcons();
    }
}

function updateQuoteNav() {
    document.getElementById('qbtn-prev').classList.toggle('hidden', quoteCurrentStep === 1);
    const nextBtn = document.getElementById('qbtn-next');
    if (quoteCurrentStep === quoteTotalSteps) {
        nextBtn.innerHTML = `<span>Submit Request</span><i data-lucide="send" class="w-4 h-4 inline ml-2"></i>`;
    } else {
        nextBtn.innerHTML = `<span>Next Step</span><i data-lucide="arrow-right" class="w-4 h-4 inline ml-2"></i>`;
    }
    lucide.createIcons();
}

function nextQuoteStep() {
    if (!validateQuoteStep(quoteCurrentStep)) return;
    if (quoteCurrentStep === quoteTotalSteps) { submitQuoteForm(); return; }
    document.getElementById(`qstp-${quoteCurrentStep}`).classList.add('hidden');
    quoteCurrentStep++;
    document.getElementById(`qstp-${quoteCurrentStep}`).classList.remove('hidden');
    document.getElementById(`qstp-${quoteCurrentStep}`).classList.add('fade-in');
    updateQuoteNav();
}

function prevQuoteStep() {
    if (quoteCurrentStep > 1) {
        document.getElementById(`qstp-${quoteCurrentStep}`).classList.add('hidden');
        quoteCurrentStep--;
        document.getElementById(`qstp-${quoteCurrentStep}`).classList.remove('hidden');
        document.getElementById(`qstp-${quoteCurrentStep}`).classList.add('fade-in');
        updateQuoteNav();
    }
}
