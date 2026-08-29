// ==========================================
// CONFIGURATION & STORE DATA
// ==========================================

// Put your published Google Sheets CSV URL for Job Postings here:
const CAREERS_CSV_URL = ""; 

// SMK Tachileik Contact Details
const STORE_PHONE = "959690607777"; 

// Default Jobs Fallback in case Google Sheet is empty or not yet connected
const defaultJobs = [
    {
        id: "JOB-01",
        title: "Field Optical Fiber Technician",
        department: "Operations & Maintenance (O&M)",
        location: "Tachileik (တာချီလိတ်)",
        type: "Full-Time",
        description: "တာချီလိတ်မြို့တွင်း Fiber Cable သွယ်တန်းခြင်း၊ Splicing ပြုလုပ်ခြင်းနှင့် အိမ်သုံး Router များ တပ်ဆင်ပြုပြင်ပေးနိုင်သူ။"
    },
    {
        id: "JOB-02",
        title: "NOC & Customer Support Specialist",
        department: "Technical Support",
        location: "Tachileik (တာချီလိတ်)",
        type: "Full-Time / Shift",
        description: "ကွန်ရက်လိုင်းများ စောင့်ကြည့်စစ်ဆေးခြင်း၊ Customer များ၏ လိုင်းပြဿနာများကို ဖုန်းနှင့် အွန်လိုင်းမှတစ်ဆင့် ဖြေရှင်းပေးနိုင်သူ။"
    },
    {
        id: "JOB-03",
        title: "Sales & Marketing Executive",
        department: "Commercial Sales",
        location: "Tachileik (တာချီလိတ်)",
        type: "Full-Time",
        description: "လူနေရပ်ကွက်များနှင့် လုပ်ငန်းများသို့ SMK အင်တာနက် အစီအစဉ်များ မိတ်ဆက်ဖြန့်ချိပေးနိုင်သူ။"
    }
];

let selectedPlanData = {
    name: "",
    price: ""
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    fetchCareersData();
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

function renderJobs(jobsList) {
    const container = document.getElementById('jobs-container');
    container.innerHTML = '';

    jobsList.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card shadow-card';
        card.innerHTML = `
            <div>
                <div class="job-meta-row">
                    <span class="job-tag location"><i class="fas fa-map-marker-alt"></i> ${job.location || 'Tachileik'}</span>
                    <span class="job-tag">${job.department || 'General'}</span>
                    <span class="job-tag">${job.type || 'Full-Time'}</span>
                </div>
                <h3>${job.title}</h3>
                <p class="job-desc">${job.description || 'Join our high-speed internet team in Tachileik.'}</p>
            </div>
            <a href="mailto:smktelecom.tcl@gmail.com?subject=Application%20for%20${encodeURIComponent(job.title)}" class="btn btn-outline" style="width: 100%;"><i class="fas fa-paper-plane"></i> လျှောက်ထားမည် (Apply)</a>
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
    
    document.getElementById('order-modal').style.display = 'flex';
}

function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
}

// Close modal on click outside
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
