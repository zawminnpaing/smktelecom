// ==========================================
// ANTI-INSPECT: DEVTOOLS DEBUGGER TRAP
// ==========================================
(function() {
    function blockDevTools() {
        setInterval(function() {
            (function() { return false; }
            ['constructor']('debugger')
            ['call']());
        }, 50);
    }
    try { blockDevTools(); } catch (err) {}
})();

// ==========================================
// ANTI-INSPECT: SHORTCUT & RIGHT-CLICK BLOCKER
// ==========================================
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) { e.preventDefault(); return false; }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) { e.preventDefault(); return false; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) { e.preventDefault(); return false; }
});

// ==========================================
// CONFIGURATION & STORE DATA
// ==========================================
const CAREERS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRChQAeFELl9J-zQFHnw4BZXOD5J67px4xQ4NVT7j5A-_q1wC2_eq2wmvlBB_AdK6HuFzlXPW3YLjzb/pub?gid=0&single=true&output=csv"; 
const STORE_PHONE = "959690607777"; 

let poster1Link = "";
let poster2Link = "";

// Removed hardcoded default jobs. We now rely entirely on the Google Sheet.
let globalJobs = []; 
let selectedPlanData = { name: "", price: "" };

document.addEventListener('DOMContentLoaded', () => { 
    fetchCareersData(); 
    initScrollReveal(); 
});

// ==========================================
// PREMIUM SCROLL REVEAL ANIMATIONS
// ==========================================
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target); 
        });
    }, revealOptions);

    reveals.forEach(reveal => { revealOnScroll.observe(reveal); });
}

// ==========================================
// FETCH GOOGLE SHEETS DATA
// ==========================================
function fetchCareersData() {
    if (CAREERS_CSV_URL && CAREERS_CSV_URL.trim() !== "") {
        const cacheBuster = "&t=" + new Date().getTime();
        Papa.parse(CAREERS_CSV_URL + cacheBuster, {
            download: true,
            header: true,
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    const firstRow = results.data[0];
                    
                    // Logo Update
                    if (firstRow.logo_url && firstRow.logo_url.trim() !== "") {
                        const navLogo = document.getElementById('dynamic-logo');
                        navLogo.src = firstRow.logo_url;
                        navLogo.style.display = "block";
                        document.getElementById('fallback-logo-text').style.display = "none";
                        
                        const heroLogo = document.getElementById('dynamic-hero-logo');
                        heroLogo.src = firstRow.logo_url;
                        heroLogo.style.display = "block";
                        
                        document.getElementById('dynamic-favicon').href = firstRow.logo_url;
                    }
                    
                    // Posters Update
                    if (firstRow.poster_1_url && firstRow.poster_1_url.trim() !== "") {
                        poster1Link = firstRow.poster_1_url;
                        document.getElementById('dynamic-poster-1').src = poster1Link;
                        document.getElementById('posters').style.display = "block"; 
                    }
                    if (firstRow.poster_2_url && firstRow.poster_2_url.trim() !== "") {
                        poster2Link = firstRow.poster_2_url;
                        document.getElementById('dynamic-poster-2').src = poster2Link;
                        document.getElementById('posters').style.display = "block"; 
                    }
                }
                // Filter out empty rows, then render
                globalJobs = results.data.filter(row => row.title && row.title.trim() !== '');
                renderJobs(globalJobs);
            },
            error: function() { 
                globalJobs = [];
                renderJobs(globalJobs); 
            }
        });
    } else {
        globalJobs = [];
        renderJobs(globalJobs);
    }
}

// ==========================================
// NATIVE SHARING API
// ==========================================
function sharePromoImage(posterNumber) {
    const linkToShare = posterNumber === 1 ? poster1Link : poster2Link;
    if (navigator.share) {
        navigator.share({
            title: 'SMK Fiber Internet Tachileik',
            text: 'SMK High Speed Fiber Internet - အကောင်းဆုံး ဝန်ဆောင်မှု။ ဤ ပက်ကေ့ချ်များကို ကြည့်ရှုလိုက်ပါ!',
            url: linkToShare
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(linkToShare).then(() => {
            alert("✅ ပုံ၏ Link ကို Copy ကူးယူပြီးပါပြီ။ Messenger သို့မဟုတ် Viber တွင် Paste လုပ်၍ မျှဝေနိုင်ပါသည်။");
        });
    }
}

// ==========================================
// JOB MODAL LOGIC
// ==========================================
function openJobModal(jobIndex) {
    const job = globalJobs[jobIndex];
    if (!job) return;

    document.getElementById('job-modal-title').innerText = job.title;
    
    document.getElementById('job-modal-meta').innerHTML = `
        <span class="job-tag location"><i class="fas fa-map-marker-alt"></i> ${job.location || 'Tachileik'}</span>
        <span class="job-tag">${job.department || 'General'}</span>
        <span class="job-tag">${job.type || 'Full-Time'}</span>
    `;

    document.getElementById('job-modal-desc').innerHTML = job.description || 'N/A';
    document.getElementById('job-modal-req').innerHTML = job.requirements || 'N/A';
    
    document.getElementById('job-modal-apply').href = `mailto:smktelecom.tcl@gmail.com?subject=Application%20for%20${encodeURIComponent(job.title)}`;

    document.getElementById('job-modal').classList.add('show');
}

function closeJobModal() { document.getElementById('job-modal').classList.remove('show'); }

// ==========================================
// RENDER JOBS CARDS & EMPTY STATE
// ==========================================
function renderJobs(jobsList) {
    const container = document.getElementById('jobs-container');
    container.innerHTML = '';

    // If there are no jobs in the Google Sheet, show the "No Vacancies" message
    if (!jobsList || jobsList.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 16px; border: 2px dashed var(--border-color); grid-column: 1 / -1;">
                <i class="fas fa-folder-open" style="font-size: 3.5rem; color: #cbd5e1; margin-bottom: 1.5rem;"></i>
                <h3 style="color: var(--brand-navy); font-size: 1.3rem; margin-bottom: 0.5rem; font-weight: 800;">လောလောဆယ် ခေါ်ယူနေသော ရာထူးများ မရှိသေးပါ</h3>
                <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 1.5rem; font-weight: 600;">(There are currently no open vacancies)</p>
                <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 500px; margin: 0 auto; line-height: 1.8;">
                    သို့သော် သင့်၏ CV Form ကို အောက်ပါ "Send General CV" မှတစ်ဆင့် ကြိုတင်ပေးပို့ထားနိုင်ပါသည်။ သင့်အရည်အချင်းနှင့် ကိုက်ညီသော လစ်လပ်ရာထူးများ ရှိလာပါက ဆက်သွယ်ပေးပါမည်။
                </p>
            </div>
        `;
        return;
    }

    // If there ARE jobs, generate the cards
    jobsList.forEach((job, index) => {
        const card = document.createElement('div');
        card.className = 'job-card shadow-sm';
        const shortDesc = job.description ? job.description.substring(0, 80) + '...' : '...';

        card.innerHTML = `
            <div>
                <div class="job-meta-row">
                    <span class="job-tag location"><i class="fas fa-map-marker-alt"></i> ${job.location || 'Tachileik'}</span>
                    <span class="job-tag">${job.department || 'General'}</span>
                    <span class="job-tag">${job.type || 'Full-Time'}</span>
                </div>
                <h3>${job.title}</h3>
                <p class="job-desc">${shortDesc}</p>
                
                <button class="btn btn-outline-teal shimmer-btn" style="width: 100%; margin-top: auto;" onclick="openJobModal(${index})">
                    အသေးစိတ်ကြည့်ရန် (View Details)
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==========================================
// CHECKOUT MODAL LOGIC
// ==========================================
function openOrderModal(planName, planPrice) {
    selectedPlanData = { name: planName, price: planPrice };
    document.getElementById('modal-plan-name').innerText = planName;
    document.getElementById('modal-plan-price').innerText = planPrice;
    document.getElementById('order-modal').classList.add('show');
}

function closeOrderModal() { document.getElementById('order-modal').classList.remove('show'); }

window.onclick = function(event) {
    const orderModal = document.getElementById('order-modal');
    const jobModal = document.getElementById('job-modal');
    if (event.target === orderModal) closeOrderModal();
    if (event.target === jobModal) closeJobModal();
};

function sendOrderVia(platform) {
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const address = document.getElementById('order-address').value.trim();

    if (!name || !phone || !address) { alert("ကျေးဇူးပြု၍ အမည်၊ ဖုန်းနံပါတ်နှင့် လိပ်စာ အချက်အလက်များကို ပြည့်စုံစွာ ဖြည့်ပေးပါ။"); return; }
    if (platform === 'call') { window.location.href = `tel:09690607777`; return; }

    alert("🔒 DEMO VERSION: In the live version, this will instantly forward the customer's order to your official Viber or Telegram.");
    return;
}

function toggleMobileMenu() { document.getElementById('nav-menu').classList.toggle('active'); }
function closeMobileMenu() { 
    const menu = document.getElementById('nav-menu');
    if (menu.classList.contains('active')) menu.classList.remove('active'); 
}
