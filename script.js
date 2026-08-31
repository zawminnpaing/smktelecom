// ==========================================
// ANTI-INSPECT: DEVTOOLS DEBUGGER TRAP
// ==========================================
(function() {
    function blockDevTools() {
        setInterval(function() {
            (function() {
                return false;
            }
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

// Global variables for sharing
let poster1Link = "";
let poster2Link = "";

const defaultJobs = [
    {
        id: "JOB-01", title: "Field Optical Fiber Technician", department: "Operations & Maintenance", location: "Tachileik (တာချီလိတ်)", type: "Full-Time",
        description: "တာချီလိတ်မြို့တွင်း Fiber Cable သွယ်တန်းခြင်း၊ Splicing ပြုလုပ်ခြင်းနှင့် အိမ်သုံး Router များ တပ်ဆင်ပြုပြင်ပေးနိုင်သူ။ အဖွဲ့အစည်းနှင့် ပူးပေါင်းလုပ်ဆောင်နိုင်ပြီး အတွေ့အကြုံရှိသူများကို ဦးစားပေးရွေးချယ်သွားမည်ဖြစ်ပါသည်။"
    }
];

let selectedPlanData = { name: "", price: "" };

document.addEventListener('DOMContentLoaded', () => { fetchCareersData(); });

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) { navbar.classList.add('scrolled'); } 
    else { navbar.classList.remove('scrolled'); }
});

// ==========================================
// FETCH GOOGLE SHEETS DATA (Jobs + Images)
// ==========================================
function fetchCareersData() {
    const jobsContainer = document.getElementById('jobs-container');

    if (CAREERS_CSV_URL && CAREERS_CSV_URL.trim() !== "") {
        const cacheBuster = "&t=" + new Date().getTime();
        Papa.parse(CAREERS_CSV_URL + cacheBuster, {
            download: true,
            header: true,
            complete: function(results) {
                // 1. Process Images from the very first row
                if (results.data && results.data.length > 0) {
                    const firstRow = results.data[0];
                    
                    // Logo Update
                    if (firstRow.logo_url && firstRow.logo_url.trim() !== "") {
                        const logoImg = document.getElementById('dynamic-logo');
                        logoImg.src = firstRow.logo_url;
                        logoImg.style.display = "block";
                        document.getElementById('fallback-logo-text').style.display = "none";
                    }

                    // Posters Update
                    if (firstRow.poster_1_url && firstRow.poster_1_url.trim() !== "") {
                        poster1Link = firstRow.poster_1_url;
                        document.getElementById('dynamic-poster-1').src = poster1Link;
                        document.getElementById('download-poster-1').href = poster1Link;
                        document.getElementById('posters').style.display = "block"; // Reveal section
                    }
                    if (firstRow.poster_2_url && firstRow.poster_2_url.trim() !== "") {
                        poster2Link = firstRow.poster_2_url;
                        document.getElementById('dynamic-poster-2').src = poster2Link;
                        document.getElementById('download-poster-2').href = poster2Link;
                        document.getElementById('posters').style.display = "block"; // Reveal section
                    }
                }

                // 2. Process Jobs
                const liveJobs = results.data.filter(row => row.title && row.title.trim() !== '');
                if (liveJobs.length > 0) { renderJobs(liveJobs); } 
                else { renderJobs(defaultJobs); }
            },
            error: function() { renderJobs(defaultJobs); }
        });
    } else {
        renderJobs(defaultJobs);
    }
}

// ==========================================
// NATIVE PHONE SHARING (Web Share API)
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
        // Fallback for browsers that don't support Native Sharing
        navigator.clipboard.writeText(linkToShare).then(() => {
            alert("✅ ပုံ၏ Link ကို Copy ကူးယူပြီးပါပြီ။ Messenger သို့မဟုတ် Viber တွင် Paste လုပ်၍ မျှဝေနိုင်ပါသည်။");
        });
    }
}

window.toggleJobDesc = function(btnElement) {
    const descContent = btnElement.previousElementSibling;
    if (descContent.classList.contains('expanded')) {
        descContent.classList.remove('expanded');
        btnElement.innerHTML = 'Read More <i class="fas fa-chevron-down"></i>';
    } else {
        descContent.classList.add('expanded');
        btnElement.innerHTML = 'Show Less <i class="fas fa-chevron-up"></i>';
    }
};

function renderJobs(jobsList) {
    const container = document.getElementById('jobs-container');
    container.innerHTML = '';

    jobsList.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card shadow-sm';
        
        card.innerHTML = `
            <div>
                <div class="job-meta-row">
                    <span class="job-tag location"><i class="fas fa-map-marker-alt"></i> ${job.location || 'Tachileik'}</span>
                    <span class="job-tag">${job.department || 'General'}</span>
                    <span class="job-tag">${job.type || 'Full-Time'}</span>
                </div>
                <h3>${job.title}</h3>
                
                <div class="job-desc-container">
                    <div class="job-desc-content">
                        <strong>Job Description:</strong><br>
                        ${job.description || 'Join our high-speed internet team in Tachileik.'}
                        <br><br>
                        <strong>Requirements:</strong><br>
                        ${job.requirements || 'Contact us for more details.'}
                    </div>
                    <button class="read-more-btn" onclick="toggleJobDesc(this)">Read More <i class="fas fa-chevron-down"></i></button>
                </div>
            </div>
            <a href="mailto:smktelecom.tcl@gmail.com?subject=Application%20for%20${encodeURIComponent(job.title)}" class="btn btn-outline-teal" style="width: 100%; margin-top: auto;"><i class="fas fa-paper-plane"></i> လျှောက်ထားမည် (Apply)</a>
        `;
        container.appendChild(card);
    });
}

function openOrderModal(planName, planPrice) {
    selectedPlanData = { name: planName, price: planPrice };
    document.getElementById('modal-plan-name').innerText = planName;
    document.getElementById('modal-plan-price').innerText = planPrice;
    document.getElementById('order-modal').classList.add('show');
}

function closeOrderModal() { document.getElementById('order-modal').classList.remove('show'); }

window.onclick = function(event) {
    const modal = document.getElementById('order-modal');
    if (event.target === modal) { closeOrderModal(); }
};

function sendOrderVia(platform) {
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const address = document.getElementById('order-address').value.trim();

    if (!name || !phone || !address) {
        alert("ကျေးဇူးပြု၍ အမည်၊ ဖုန်းနံပါတ်နှင့် လိပ်စာ အချက်အလက်များကို ပြည့်စုံစွာ ဖြည့်ပေးပါ။"); return;
    }

    if (platform === 'call') { window.location.href = `tel:09690607777`; return; }

    alert("🔒 DEMO VERSION: In the live version, this will instantly forward the customer's order to your official Viber or Telegram.");
    return;
}

function toggleMobileMenu() { document.getElementById('nav-menu').classList.toggle('active'); }
function closeMobileMenu() { 
    const menu = document.getElementById('nav-menu');
    if (menu.classList.contains('active')) menu.classList.remove('active'); 
}
