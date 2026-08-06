/* ==========================================================================
   JavaScript for Mohamed & Roaa Wedding Invitation
   ========================================================================== */

// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://yhmirxounaearxayjics.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WjUhhou5CNIVpnBqldo7MA_4fK7ehSy';
const SUPABASE_HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
};

async function supabaseInsert(data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rsvp_responses`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
    return true;
}

async function supabaseFetchAll() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rsvp_responses?select=*&order=created_at.desc`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    if (!res.ok) throw new Error(`Supabase fetch error: ${res.status}`);
    return await res.json();
}

async function supabaseDeleteAll() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rsvp_responses?id=gte.0`, {
        method: 'DELETE',
        headers: SUPABASE_HEADERS
    });
    if (!res.ok) throw new Error(`Supabase delete error: ${res.status}`);
    return true;
}

document.addEventListener('DOMContentLoaded', () => {

    // ==================== PAGE TRANSITION ====================
    const welcomeScreen = document.getElementById('welcome-screen');
    const invitationScreen = document.getElementById('invitation-screen');
    const btnStart = document.getElementById('btn-start');

    if (btnStart) {
        btnStart.addEventListener('click', () => {
            welcomeScreen.style.opacity = '0';
            welcomeScreen.style.transform = 'scale(0.95)';
            welcomeScreen.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

            setTimeout(() => {
                welcomeScreen.classList.remove('active-page');
                welcomeScreen.classList.add('hidden-page');
                invitationScreen.classList.remove('hidden-page');
                invitationScreen.classList.add('active-page');
                window.scrollTo({ top: 0, behavior: 'instant' });
                initScrollReveal();
            }, 800);
        });
    }

    // ==================== SCROLL REVEAL ====================
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
        reveals.forEach(el => revealObserver.observe(el));
    }

    window.addEventListener('scroll', () => {
        if (invitationScreen.classList.contains('active-page')) {
            document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight - 50) {
                    el.classList.add('visible');
                }
            });
        }
    });

    // ==================== MODALS ====================
    const rsvpTrigger = document.getElementById('btn-rsvp-trigger');
    const rsvpModal = document.getElementById('rsvp-modal');
    const rsvpClose = document.getElementById('btn-close-rsvp');
    const adminModal = document.getElementById('admin-modal');
    const adminClose = document.getElementById('btn-close-admin');

    if (rsvpTrigger) rsvpTrigger.addEventListener('click', () => {
        rsvpModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    });

    if (rsvpClose) rsvpClose.addEventListener('click', () => {
        rsvpModal.classList.remove('open');
        document.body.style.overflow = '';
    });

    if (adminClose) adminClose.addEventListener('click', () => {
        adminModal.classList.remove('open');
        document.body.style.overflow = '';
    });

    window.addEventListener('click', (e) => {
        if (e.target === rsvpModal) { rsvpModal.classList.remove('open'); document.body.style.overflow = ''; }
        if (e.target === adminModal) { adminModal.classList.remove('open'); document.body.style.overflow = ''; }
    });

    // Hide guests field if absent
    const rsvpStatusRadios = document.getElementsByName('rsvp-status');
    const groupGuests = document.getElementById('group-guests');
    rsvpStatusRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'absent') {
                groupGuests.style.opacity = '0';
                groupGuests.style.pointerEvents = 'none';
                setTimeout(() => { groupGuests.style.display = 'none'; }, 300);
            } else {
                groupGuests.style.display = 'block';
                setTimeout(() => { groupGuests.style.opacity = '1'; groupGuests.style.pointerEvents = 'auto'; }, 10);
            }
        });
    });

    // ==================== RSVP FORM SUBMISSION ====================
    const formRsvp = document.getElementById('form-rsvp');

    if (formRsvp) {
        formRsvp.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name    = document.getElementById('rsvp-name').value.trim();
            const status  = document.querySelector('input[name="rsvp-status"]:checked').value;
            const guests  = parseInt(document.getElementById('rsvp-guests').value);
            const message = document.getElementById('rsvp-message').value.trim();
            const statusLabel = status === 'attending' ? 'مؤكد الحضور ✅' : 'معتذر ❌';

            const modalContent = document.querySelector('#rsvp-modal .modal-card');

            // Show loading
            modalContent.innerHTML = `
                <div style="text-align:center; padding:3rem 1rem;">
                    <div style="font-size:3rem; margin-bottom:1rem; animation:coupleFloat 1s ease-in-out infinite alternate;">⏳</div>
                    <p style="color:var(--text-muted);">جاري تسجيل حضورك...</p>
                </div>`;

            try {
                // 1️⃣ Save to Supabase database
                await supabaseInsert({ name, status, guests, message });

                // 2️⃣ Send email notification via Web3Forms
                const formData = new FormData();
                formData.append('access_key', 'ba88f688-bc9b-4f55-ae30-7e96763720f0');
                formData.append('subject', `تأكيد حضور جديد - ${name} - حفل زفاف محمد و رؤى`);
                formData.append('from_name', 'دعوة زفاف محمد و رؤى');
                formData.append('الاسم', name);
                formData.append('حالة الحضور', statusLabel);
                formData.append('عدد المرافقين', status === 'attending' ? guests : 'لا ينطبق');
                formData.append('رسالة التهنئة', message || 'لا توجد رسالة');
                await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });

                // ✅ Success screen
                modalContent.innerHTML = `
                    <div style="text-align:center; padding:2rem 1rem;">
                        <div style="font-size:4.5rem; margin-bottom:1.2rem; animation:heartbeat 1.5s ease infinite;">🎉</div>
                        <h3 style="color:var(--gold-color); font-size:1.8rem; margin-bottom:0.8rem; font-weight:700;">تم تسجيل الحضور بنجاح!</h3>
                        <p style="color:var(--text-dark); margin-bottom:2rem; font-size:1.05rem;">شكراً جزيلاً لتأكيد حضورك الكريم. نسعد جداً برؤيتك ومشاركتنا فرحتنا. ❤️</p>
                        <button id="btn-done-close" class="btn-primary shimmer-effect" style="width:100%;"><span>موافق</span></button>
                    </div>`;

            } catch (err) {
                modalContent.innerHTML = `
                    <div style="text-align:center; padding:2rem 1rem;">
                        <div style="font-size:3.5rem; margin-bottom:1rem;">⚠️</div>
                        <h3 style="color:var(--gold-color); font-size:1.5rem; margin-bottom:0.8rem;">حدث خطأ</h3>
                        <p style="color:var(--text-muted); margin-bottom:2rem;">يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.</p>
                        <button id="btn-done-close" class="btn-primary" style="width:100%;"><span>حسناً</span></button>
                    </div>`;
            }

            setTimeout(() => {
                const closeBtn = document.getElementById('btn-done-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        rsvpModal.classList.remove('open');
                        document.body.style.overflow = '';
                        setTimeout(() => window.location.reload(), 500);
                    });
                }
            }, 100);
        });
    }

    // ==================== SECRET ADMIN PANEL ====================
    const devLogoTrigger = document.getElementById('dev-logo-trigger');
    let clickCount = 0;
    let clickTimer;

    if (devLogoTrigger) {
        devLogoTrigger.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { clickCount = 0; }, 3000);
            if (clickCount >= 5) {
                clickCount = 0;
                openAdminDashboard();
            }
        });
    }

    async function openAdminDashboard() {
        // Show loading state in admin
        document.getElementById('stat-total').innerText = '...';
        document.getElementById('stat-attending').innerText = '...';
        document.getElementById('stat-absent').innerText = '...';
        document.getElementById('stat-guests').innerText = '...';
        document.getElementById('admin-table-body').innerHTML =
            `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">جاري تحميل البيانات... ⏳</td></tr>`;

        adminModal.classList.add('open');
        document.body.style.overflow = 'hidden';

        try {
            const rsvpList = await supabaseFetchAll();

            // Stats
            const total       = rsvpList.length;
            const attending   = rsvpList.filter(r => r.status === 'attending').length;
            const absent      = rsvpList.filter(r => r.status === 'absent').length;
            const totalGuests = rsvpList.reduce((acc, r) => acc + (r.status === 'attending' ? (r.guests || 0) : 0), 0);

            document.getElementById('stat-total').innerText     = total;
            document.getElementById('stat-attending').innerText = attending;
            document.getElementById('stat-absent').innerText    = absent;
            document.getElementById('stat-guests').innerText    = totalGuests;

            // Table
            const tableBody = document.getElementById('admin-table-body');
            tableBody.innerHTML = '';

            if (rsvpList.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:2rem;">لا توجد أي تأكيدات حضور بعد.</td></tr>`;
            } else {
                rsvpList.forEach(rsvp => {
                    const tr = document.createElement('tr');
                    const statusLabel = rsvp.status === 'attending' ? 'مؤكد الحضور' : 'معتذر';
                    const statusClass = rsvp.status === 'attending' ? 'status-tag attending' : 'status-tag absent';
                    const date = rsvp.created_at ? new Date(rsvp.created_at).toLocaleString('ar-EG') : '-';
                    tr.innerHTML = `
                        <td style="font-weight:600;">${escapeHTML(rsvp.name || '')}</td>
                        <td><span class="${statusClass}">${statusLabel}</span></td>
                        <td>${rsvp.status === 'attending' ? (rsvp.guests || 0) : '-'}</td>
                        <td style="font-size:0.85rem; max-width:250px; white-space:normal; word-break:break-word;">${escapeHTML(rsvp.message || '')}</td>
                        <td style="font-size:0.8rem; color:var(--text-muted);">${date}</td>`;
                    tableBody.appendChild(tr);
                });
            }

            // Store for CSV export
            window._rsvpData = rsvpList;

        } catch (err) {
            document.getElementById('admin-table-body').innerHTML =
                `<tr><td colspan="5" style="text-align:center; color:#d9534f; padding:2rem;">فشل تحميل البيانات. تحقق من الاتصال.</td></tr>`;
        }
    }

    function escapeHTML(str) {
        return String(str).replace(/[&<>'"]/g, tag =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // ==================== CSV EXPORT ====================
    const btnDownloadCSV = document.getElementById('btn-download-csv');
    if (btnDownloadCSV) {
        btnDownloadCSV.addEventListener('click', () => {
            const rsvpList = window._rsvpData || [];
            if (rsvpList.length === 0) { alert('لا توجد بيانات لتحميلها!'); return; }

            let csv = "\uFEFF";
            csv += "الاسم,حالة الحضور,عدد المرافقين,الرسالة,تاريخ التسجيل\n";
            rsvpList.forEach(r => {
                const st    = r.status === 'attending' ? 'حاضر' : 'معتذر';
                const g     = r.status === 'attending' ? (r.guests || 0) : 0;
                const date  = r.created_at ? new Date(r.created_at).toLocaleString('ar-EG') : '';
                csv += `"${(r.name||'').replace(/"/g,'""')}",${st},${g},"${(r.message||'').replace(/"/g,'""')}","${date}"\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'تأكيدات_حضور_زفاف_محمد_ورؤى.csv';
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // ==================== CLEAR DATABASE ====================
    const btnClearDB = document.getElementById('btn-clear-db');
    if (btnClearDB) {
        btnClearDB.addEventListener('click', async () => {
            if (!confirm('هل أنت متأكد من مسح جميع تأكيدات الحضور؟ لا يمكن التراجع!')) return;
            try {
                await supabaseDeleteAll();
                alert('تم مسح جميع البيانات بنجاح.');
                openAdminDashboard();
            } catch(err) {
                alert('فشل المسح. يرجى المحاولة مجدداً.');
            }
        });
    }

});
