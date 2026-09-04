// ==========================================
// ANTI-INSPECT: DEVTOOLS DEBUGGER TRAP
// ==========================================
(function() {
    function blockDevTools() {
        setInterval(function() { (function() { return false; } ['constructor']('debugger') ['call']()); }, 50);
    }
    try { blockDevTools(); } catch (err) {}
})();

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) { e.preventDefault(); return false; }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) { e.preventDefault(); return false; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) { e.preventDefault(); return false; }
});

const CAREERS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRChQAeFELl9J-zQFHnw4BZXOD5J67px4xQ4NVT7j5A-_q1wC2_eq2wmvlBB_AdK6HuFzlXPW3YLjzb/pub?gid=0&single=true&output=csv"; 
const PACKAGES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRChQAeFELl9J-zQFHnw4BZXOD5J67px4xQ4NVT7j5A-_q1wC2_eq2wmvlBB_AdK6HuFzlXPW3YLjzb/pub?gid=2060778030&single=true&output=csv";

// REAL LIVE NUMBER CONFIGURED HERE
const STORE_PHONE = "959793155856"; 

let globalJobs = []; 
let selectedPlanData = { name: "", price: "" };
let pendingContactMessage = ""; 

document.addEventListener('DOMContentLoaded', () => { 
    fetchCareersData(); 
    fetchPackagesData(); 
    initScrollReveal(); 
});

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
// DYNAMIC PACKAGES WITH ICONS
// ==========================================
function fetchPackagesData() {
    const packagesContainer = document.getElementById('packages-container');
    if (PACKAGES_CSV_URL && PACKAGES_CSV_URL.trim() !== "") {
        Papa.parse(PACKAGES_CSV_URL + "&t=" + new Date().getTime(), {
            download: true, header: true,
            complete: function(results) {
                packagesContainer.innerHTML = '';
                const livePlans = results.data.filter(row => row.plan_name && row.plan_name.trim() !== '');
                if (livePlans.length === 0) { packagesContainer.innerHTML = '<p style="text-align:center;">No packages available.</p>'; return; }

                const groupedPlans = {};
                const categories = []; 
                livePlans.forEach(plan => {
                    const cat = plan.category ? plan.category.trim() : 'Other Plans';
                    if (!groupedPlans[cat]) { groupedPlans[cat] = []; categories.push(cat); }
                    groupedPlans[cat].push(plan);
                });

                categories.forEach((cat, index) => {
                    const themeNum = (index % 10) + 1;
                    
                    let iconHtml = '<i class="fas fa-server"></i>';
                    if (cat.toLowerCase().includes('home')) iconHtml = '<i class="fas fa-home"></i>';
                    if (cat.toLowerCase().includes('business') || cat.toLowerCase().includes('enterprise')) iconHtml = '<i class="fas fa-building"></i>';

                    const title = document.createElement('div');
                    title.className = 'tier-title reveal active'; 
                    title.innerHTML = `${iconHtml} ${cat}`;
                    if (index > 0) title.style.marginTop = '4rem'; 
                    packagesContainer.appendChild(title);

                    const grid = document.createElement('div');
                    grid.className = 'package-grid reveal active';

                    groupedPlans[cat].forEach(plan => {
                        const card = document.createElement('div');
                        const hasBadge = (plan.badge && plan.badge.trim() !== '');
                        const badgeHtml = hasBadge ? `<div class="badge-dynamic">${plan.badge.trim()}</div>` : '';
                        const badgeClass = hasBadge ? ' has-badge' : '';
                        card.className = `package-card theme-${themeNum}${badgeClass}`;
                        
                        const planDesc = (plan.description && plan.description.trim() !== '') ? `<p class="plan-desc">${plan.description.trim()}</p>` : '';
                        let btnClass = 'btn-outline-teal';
                        if ([2, 4, 10].includes(themeNum)) btnClass = 'btn-primary'; 
                        if ([5, 7].includes(themeNum)) btnClass = 'btn-outline'; 
                        if ([3, 6].includes(themeNum)) btnClass = 'btn-teal-solid'; 
                        if ([8, 9].includes(themeNum)) btnClass = 'btn-outline-teal'; 
                        if (hasBadge) btnClass = 'btn-primary';

                        card.innerHTML = `
                            ${badgeHtml}
                            <div class="card-header"><h3>${plan.speed}</h3><p class="plan-subtitle">${plan.plan_name}</p></div>
                            ${planDesc}
                            <div class="card-price"><span class="price-val">${plan.price}</span><span class="price-curr"></span></div>
                            <button class="btn ${btnClass} shimmer-btn" style="width: 100%;" onclick="openOrderModal('${plan.plan_name}', '${plan.price}')">တပ်ဆင်မည် (Apply)</button>
                        `;
                        grid.appendChild(card);
                    });
                    packagesContainer.appendChild(grid);
                });
            }
        });
    }
}

// ==========================================
// JOBS & LOGOS
// ==========================================
function fetchCareersData() {
    const jobsContainer = document.getElementById('jobs-container');
    if (CAREERS_CSV_URL && CAREERS_CSV_URL.trim() !== "") {
        Papa.parse(CAREERS_CSV_URL + "&t=" + new Date().getTime(), {
            download: true, header: true,
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    const firstRow = results.data[0];
                    if (firstRow.logo_url && firstRow.logo_url.trim() !== "") {
                        document.getElementById('dynamic-logo').src = firstRow.logo_url;
                        document.getElementById('dynamic-logo').style.display = "block";
                        document.getElementById('fallback-logo-text').style.display = "none";
                        document.getElementById('dynamic-hero-logo').src = firstRow.logo_url;
                        document.getElementById('dynamic-hero-logo').style.display = "block";
                        document.getElementById('dynamic-favicon').href = firstRow.logo_url;
                    }
                    if (firstRow.poster_1_url && firstRow.poster_1_url.trim() !== "") {
                        document.getElementById('dynamic-poster-1').src = firstRow.poster_1_url;
                        document.getElementById('posters').style.display = "block"; 
                    }
                    if (firstRow.poster_2_url && firstRow.poster_2_url.trim() !== "") {
                        document.getElementById('dynamic-poster-2').src = firstRow.poster_2_url;
                        document.getElementById('posters').style.display = "block"; 
                    }
                }
                globalJobs = results.data.filter(row => row.title && row.title.trim() !== '');
                renderJobs(globalJobs);
            }
        });
    }
}

function renderJobs(jobsList) {
    const container = document.getElementById('jobs-container');
    container.innerHTML = '';
    if (!jobsList || jobsList.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 4rem 2rem; background: #fff; border-radius: 16px; border: 2px dashed var(--border-color); grid-column: 1 / -1;"><i class="fas fa-folder-open" style="font-size: 3.5rem; color: #cbd5e1; margin-bottom: 1.5rem;"></i><h3 style="color: var(--brand-navy); font-size: 1.3rem; margin-bottom: 0.5rem; font-weight: 800;">လောလောဆယ် ခေါ်ယူနေသော ရာထူးများ မရှိသေးပါ</h3><p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 1.5rem; font-weight: 600;">(There are currently no open vacancies)</p></div>`;
        return;
    }
    jobsList.forEach((job, index) => {
        const card = document.createElement('div');
        card.className = 'job-card shadow-sm';
        const shortDesc = job.description ? job.description.substring(0, 80) + '...' : '...';
        card.innerHTML = `<div><div class="job-meta-row"><span class="job-tag location"><i class="fas fa-map-marker-alt"></i> ${job.location || 'Tachileik'}</span><span class="job-tag">${job.department || 'General'}</span><span class="job-tag">${job.type || 'Full-Time'}</span></div><h3>${job.title}</h3><p class="job-desc">${shortDesc}</p><button class="btn btn-outline-teal shimmer-btn" style="width: 100%; margin-top: auto;" onclick="openJobModal(${index})">အသေးစိတ်ကြည့်ရန် (View Details)</button></div>`;
        container.appendChild(card);
    });
}

// ==========================================
// MODALS LOGIC
// ==========================================
function openJobModal(jobIndex) {
    const job = globalJobs[jobIndex];
    if (!job) return;
    document.getElementById('job-modal-title').innerText = job.title;
    document.getElementById('job-modal-meta').innerHTML = `<span class="job-tag location"><i class="fas fa-map-marker-alt"></i> ${job.location || 'Tachileik'}</span><span class="job-tag">${job.department || 'General'}</span><span class="job-tag">${job.type || 'Full-Time'}</span>`;
    document.getElementById('job-modal-desc').innerHTML = job.description || 'N/A';
    document.getElementById('job-modal-req').innerHTML = job.requirements || 'N/A';
    document.getElementById('job-modal-apply').href = `mailto:smktelecom.tcl@gmail.com?subject=Application%20for%20${encodeURIComponent(job.title)}`;
    document.getElementById('job-modal').classList.add('show');
}
function closeJobModal() { document.getElementById('job-modal').classList.remove('show'); }

function openOrderModal(planName, planPrice) {
    selectedPlanData = { name: planName, price: planPrice };
    document.getElementById('modal-plan-name').innerText = planName;
    document.getElementById('modal-plan-price').innerText = planPrice;
    document.getElementById('order-modal').classList.add('show');
}
function closeOrderModal() { document.getElementById('order-modal').classList.remove('show'); }

// ==========================================
// LIVE LIVE MESSAGING LOGIC
// ==========================================
function submitContactForm(event) {
    event.preventDefault(); 
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    pendingContactMessage = `📩 [SMK WEBSITE INQUIRY]\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📧 Email: ${email || 'Not provided'}\n📌 Subject: ${subject}\n\n💬 Message:\n${message}`;
    document.getElementById('contact-action-modal').classList.add('show');
}
function closeContactActionModal() { document.getElementById('contact-action-modal').classList.remove('show'); }

function dispatchContactMessage(platform) {
    const encodedMessage = encodeURIComponent(pendingContactMessage);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (platform === 'telegram') {
        if (isMobile) window.open(`https://t.me/+${STORE_PHONE}?text=${encodedMessage}`, '_blank');
        else window.open(`tg://resolve?phone=${STORE_PHONE}&text=${encodedMessage}`, '_self');
    } else if (platform === 'viber') {
        if (isMobile) window.open(`viber://chat?number=%2B${STORE_PHONE}&draft=${encodedMessage}`, '_blank');
        else window.open(`viber://chat?number=%2B${STORE_PHONE}&draft=${encodedMessage}`, '_self');
    }
    closeContactActionModal();
}

function sendOrderVia(platform) {
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const address = document.getElementById('order-address').value.trim();

    if (!name || !phone || !address) { alert("ကျေးဇူးပြု၍ အမည်၊ ဖုန်းနံပါတ်နှင့် လိပ်စာ အချက်အလက်များကို ပြည့်စုံစွာ ဖြည့်ပေးပါ။"); return; }
    
    const message = `🌐 [SMK FIBER INTERNET]\n\nအင်တာနက်တပ်ဆင်လိုပါသည် -\n📦 PACKAGE: ${selectedPlanData.name} (${selectedPlanData.price})\n\n👤 CUSTOMER DETAILS:\nအမည်: ${name}\nဖုန်း: ${phone}\nလိပ်စာ: ${address}\n\n(တည်နေရာနှင့် အသေးစိတ်ကို ဆက်သွယ်ပေးပို့ပါမည်။)`;
    const encodedMessage = encodeURIComponent(message);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (platform === 'telegram') {
        if (isMobile) window.open(`https://t.me/+${STORE_PHONE}?text=${encodedMessage}`, '_blank');
        else window.open(`tg://resolve?phone=${STORE_PHONE}&text=${encodedMessage}`, '_self');
    } else if (platform === 'viber') {
        if (isMobile) window.open(`viber://chat?number=%2B${STORE_PHONE}&draft=${encodedMessage}`, '_blank');
        else window.open(`viber://chat?number=%2B${STORE_PHONE}&draft=${encodedMessage}`, '_self');
    }
}

window.onclick = function(event) {
    if (event.target === document.getElementById('order-modal')) closeOrderModal();
    if (event.target === document.getElementById('job-modal')) closeJobModal();
    if (event.target === document.getElementById('contact-action-modal')) closeContactActionModal();
};

function toggleMobileMenu() { document.getElementById('nav-menu').classList.toggle('active'); }
function closeMobileMenu() { 
    const menu = document.getElementById('nav-menu');
    if (menu.classList.contains('active')) menu.classList.remove('active'); 
}
