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
    try {
        blockDevTools();
    } catch (err) {}
})();

// ==========================================
// ANTI-INSPECT: SHORTCUT & RIGHT-CLICK BLOCKER
// ==========================================
document.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('keydown', (e) => {
    // Block F12
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    // Block Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
    }
    // Block Ctrl+Shift+I / J / C
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && 
        ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        return false;
    }
    // Block Ctrl+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
        e.preventDefault();
        return false;
    }
});

// ==========================================
// CONFIGURATION & STORE DATA
// ==========================================

// Put your published Google Sheets CSV URL for Job Postings here later
const CAREERS_CSV_URL = ""; 

// SMK Tachileik Contact Details
const STORE_PHONE = "959690607777"; 

// Hardcoded Beautiful Fallback Jobs
const defaultJobs = [
    {
        id: "JOB-01",
        title: "Field Optical Fiber Technician",
        department: "Operations & Maintenance",
        location: "Tachileik (တာချီလိတ်)",
        type: "Full-Time",
        description: "တာချီလိတ်မြို့တွင်း Fiber Cable သွယ်တန်းခြင်း၊ Splicing ပြုလုပ်ခြင်းနှင့် အိမ်သုံး Router များ တပ်ဆင်ပြုပြင်ပေးနိုင်သူ။ အဖွဲ့အစည်းနှင့် ပူးပေါင်းလုပ်ဆောင်နိုင်ပြီး အတွေ့အကြုံရှိသူများကို ဦးစားပေးရွေးချယ်သွားမည်ဖြစ်ပါသည်။"
    },
    {
        id: "JOB-02",
        title: "NOC & Customer Support Specialist",
        department: "Technical Support",
        location: "Tachileik (တာချီလိတ်)",
        type: "Shift Schedule",
        description: "ကွန်ရက်လိုင်းများ စောင့်ကြည့်စစ်ဆေးခြင်း (Network Monitoring) နှင့် Customer များ၏ လိုင်းပြဿနာများကို ဖုန်း၊ အွန်လိုင်းမှ ဖြေရှင်းပေးနိုင်သူ။ ဆက်သွယ်ပြောဆိုမှု ကောင်းမွန်ပြီး ညဆိုင်း တာဝန်ထမ်းဆောင်နိုင်ရမည်။"
    },
    {
        id: "JOB-03",
        title: "Sales & Marketing Executive",
        department: "Commercial Sales",
        location: "Tachileik (တာချီလိတ်)",
        type: "Full-Time",
        description: "လူနေရပ်ကွက်များနှင့် စီးပွားရေးလုပ်ငန်းများသို့ SMK အင်တာနက် အစီအစဉ်များ မိတ်ဆက်ဖြန့်ချိပေးနိုင်သူ။ Marketing နယ်ပယ်တွင် စိတ်ဝင်စားမှုရှိပြီး အပြင်ထွက်၍ Active ဖြစ်ဖြစ် လုပ်ကိုင်နိုင်သူများကို ကြိုဆိုပါသည်။"
    }
];

let selectedPlanData = {
    name: "",
    price: ""
};

// ==========================================
// INITIALIZATION & SCROLL EVENTS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    fetchCareersData();
});

// Dynamic Sticky Navbar Animation
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ==========================================
// GOOGLE SHEETS CAREERS FETCHER
// ==========================================
function fetchCareersData() {
    const jobsContainer = document.getElementById('jobs-container');

    if (CAREERS_CSV_URL && CAREERS_CSV_URL.trim() !== "") {
        const cacheBuster = "&t=" + new Date().getTime();
        Papa.parse(CAREERS_CSV_URL + cacheBuster, {
            download: true,
            header: true,
            complete: function(results) {
                const liveJobs = results.data.filter(row => row.title && row.title.trim() !== '');
                if (liveJobs.length > 0) {
                    renderJobs(liveJobs);
                } else {
                    renderJobs(defaultJobs);
                }
            },
            error: function() {
                renderJobs(defaultJobs);
            }
        });
    } else {
        renderJobs(defaultJobs);
    }
}

// Global JS function to expand/collapse long Job Descriptions
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
                    <div class="job-desc-content">${job.description || 'Join our high-speed internet team in Tachileik.'}</div>
                    <button class="read-more-btn" onclick="toggleJobDesc(this)">Read More <i class="fas fa-chevron-down"></i></button>
                </div>
            </div>
            <a href="mailto:smktelecom.tcl@gmail.com?subject=Application%20for%20${encodeURIComponent(job.title)}" class="btn btn-outline-teal" style="width: 100%; margin-top: auto;"><i class="fas fa-paper-plane"></i> လျှောက်ထားမည် (Apply)</a>
        `;
        container.appendChild(card);
    });
}

// ==========================================
// MODAL & INQUIRY / ORDER LOGIC
// ==========================================
function openOrderModal(planName, planPrice) {
    selectedPlanData = { name: planName, price: planPrice };
    
    document.getElementById('modal-plan-name').innerText = planName;
    document.getElementById('modal-plan-price').innerText = planPrice;
    
    const modal = document.getElementById('order-modal');
    modal.classList.add('show');
}

function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    modal.classList.remove('show');
}

window.onclick = function(event) {
    const modal = document.getElementById('order-modal');
    if (event.target === modal) {
        closeOrderModal();
    }
};

function sendOrderVia(platform) {
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const address = document.getElementById('order-address').value.trim();

    if (!name || !phone || !address) {
        alert("ကျေးဇူးပြု၍ အမည်၊ ဖုန်းနံပါတ်နှင့် လိပ်စာ အချက်အလက်များကို ပြည့်စုံစွာ ဖြည့်ပေးပါ။");
        return;
    }

    if (platform === 'call') {
        window.location.href = `tel:09690607777`;
        return;
    }

    // ==========================================
    // DEMO MODE: BREAK THE CHECKOUT
    // ==========================================
    alert("🔒 DEMO VERSION: In the live version, this will instantly forward the customer's order to your official Viber or Telegram.");
    return;
    // ==========================================

    const message = `🌐 [SMK FIBER INTERNET - TACHILEIK]\n\nအင်တာနက်တပ်ဆင်လိုပါသည် -\n📦 PACKAGE: ${selectedPlanData.name} (${selectedPlanData.price})\n\n👤 CUSTOMER DETAILS:\nအမည်: ${name}\nဖုန်း: ${phone}\nလိပ်စာ: ${address}\n\n(တည်နေရာနှင့် အသေးစိတ်ကို ဆက်သွယ်ပေးပို့ပါမည်။)`;
    const encodedMessage = encodeURIComponent(message);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (platform === 'telegram') {
        if (isMobile) {
            window.open(`https://t.me/+${STORE_PHONE}?text=${encodedMessage}`, '_blank');
        } else {
            navigator.clipboard.writeText(message).then(() => {
                alert("အော်ဒါ အချက်အလက်များကို ကူးယူပြီးပါပြီ! Telegram ဖွင့်လာပါက Paste လုပ်၍ ပေးပို့နိုင်ပါသည်။");
                window.open(`tg://resolve?phone=${STORE_PHONE}&text=${encodedMessage}`, '_self');
            }).catch(() => {
                window.open(`tg://resolve?phone=${STORE_PHONE}&text=${encodedMessage}`, '_self');
            });
        }
    } else if (platform === 'viber') {
        if (isMobile) {
            window.open(`viber://chat?number=%2B${STORE_PHONE}&draft=${encodedMessage}`, '_blank');
        } else {
            navigator.clipboard.writeText(message).then(() => {
                alert("အော်ဒါ အချက်အလက်များကို ကူးယူပြီးပါပြီ! Viber ဖွင့်လာပါက Paste လုပ်၍ ပေးပို့နိုင်ပါသည်။");
                window.open(`viber://chat?number=%2B${STORE_PHONE}&draft=${encodedMessage}`, '_self');
            }).catch(() => {
                window.open(`viber://chat?number=%2B${STORE_PHONE}&draft=${encodedMessage}`, '_self');
            });
        }
    }
}

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
function toggleMobileMenu() {
    const menu = document.getElementById('nav-menu');
    menu.classList.toggle('active');
}

function closeMobileMenu() {
    const menu = document.getElementById('nav-menu');
    if (menu.classList.contains('active')) {
        menu.classList.remove('active');
    }
}
