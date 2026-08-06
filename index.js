/* ==========================================================================
   JavaScript for Mohamed & Roaa Wedding Invitation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==================== PAGE TRANSITION ====================
    const welcomeScreen = document.getElementById('welcome-screen');
    const invitationScreen = document.getElementById('invitation-screen');
    const btnStart = document.getElementById('btn-start');

    if (btnStart) {
        btnStart.addEventListener('click', () => {
            // Fade out welcome screen
            welcomeScreen.style.opacity = '0';
            welcomeScreen.style.transform = 'scale(0.95)';
            welcomeScreen.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

            setTimeout(() => {
                welcomeScreen.classList.remove('active-page');
                welcomeScreen.classList.add('hidden-page');
                
                invitationScreen.classList.remove('hidden-page');
                invitationScreen.classList.add('active-page');
                
                // Scroll to top of the invitation page
                window.scrollTo({ top: 0, behavior: 'instant' });
                
                // Initialize Scroll Reveal after transition
                initScrollReveal();
            }, 800);
        });
    }

    // ==================== SCROLL REVEAL (IntersectionObserver) ====================
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        
        const revealCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop observing once visible
                    observer.unobserve(entry.target);
                }
            });
        };

        const revealObserver = new IntersectionObserver(revealCallback, {
            root: null, // viewport
            threshold: 0.15, // 15% of element visible
            rootMargin: '0px 0px -50px 0px' // offset to trigger slightly before/after scroll
        });

        reveals.forEach(el => revealObserver.observe(el));
    }

    // Backup initialization if already visible or on scroll fallback
    window.addEventListener('scroll', () => {
        if (invitationScreen.classList.contains('active-page')) {
            const reveals = document.querySelectorAll('.reveal:not(.visible)');
            reveals.forEach(el => {
                const elementTop = el.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                if (elementTop < windowHeight - 50) {
                    el.classList.add('visible');
                }
            });
        }
    });

    // ==================== MODAL OVERLAYS (RSVP & Admin) ====================
    const rsvpTrigger = document.getElementById('btn-rsvp-trigger');
    const rsvpModal = document.getElementById('rsvp-modal');
    const rsvpClose = document.getElementById('btn-close-rsvp');
    
    const adminModal = document.getElementById('admin-modal');
    const adminClose = document.getElementById('btn-close-admin');

    // Open RSVP Modal
    if (rsvpTrigger && rsvpModal) {
        rsvpTrigger.addEventListener('click', () => {
            rsvpModal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Disable background scroll
        });
    }

    // Close RSVP Modal
    if (rsvpClose && rsvpModal) {
        rsvpClose.addEventListener('click', () => {
            rsvpModal.classList.remove('open');
            document.body.style.overflow = ''; // Enable scroll
        });
    }

    // Close Admin Modal
    if (adminClose && adminModal) {
        adminClose.addEventListener('click', () => {
            adminModal.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // Close modals by clicking on the overlay background
    window.addEventListener('click', (e) => {
        if (e.target === rsvpModal) {
            rsvpModal.classList.remove('open');
            document.body.style.overflow = '';
        }
        if (e.target === adminModal) {
            adminModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    // Hide/Show guests group in RSVP form based on attendance choice
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
                setTimeout(() => {
                    groupGuests.style.opacity = '1';
                    groupGuests.style.pointerEvents = 'auto';
                }, 10);
            }
        });
    });

    // ==================== RSVP FORM SUBMISSION ====================
    const formRsvp = document.getElementById('form-rsvp');

    if (formRsvp) {
        formRsvp.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('rsvp-name').value.trim();
            const status = document.querySelector('input[name="rsvp-status"]:checked').value;
            const guests = parseInt(document.getElementById('rsvp-guests').value);
            const message = document.getElementById('rsvp-message').value.trim();
            const timestamp = new Date().toLocaleString('ar-EG');

            // Save to localStorage
            const newResponse = { name, status, guests, message, timestamp };
            let rsvpList = JSON.parse(localStorage.getItem('rsvp_responses')) || [];
            rsvpList.push(newResponse);
            localStorage.setItem('rsvp_responses', JSON.stringify(rsvpList));

            // UI Thank you State Transition in Modal
            const modalContent = document.querySelector('#rsvp-modal .modal-card');
            const originalHTML = modalContent.innerHTML;

            modalContent.innerHTML = `
                <div class="modal-success-state" style="text-align: center; padding: 2rem 1rem;">
                    <div style="font-size: 4.5rem; margin-bottom: 1.2rem; animation: heartbeat 1.5s ease infinite;">🎉</div>
                    <h3 style="color: var(--gold-color); font-size: 1.8rem; margin-bottom: 0.8rem; font-weight: 700;">تم تسجيل الحضور بنجاح!</h3>
                    <p style="color: var(--text-dark); margin-bottom: 2rem; font-size: 1.05rem;">شكراً جزيلاً لتأكيد حضورك الكريم. نسعد جداً برؤيتك ومشاركتنا فرحتنا. ❤️</p>
                    <button id="btn-done-close" class="btn-primary shimmer-effect" style="width: 100%;"><span>موافق</span></button>
                </div>
            `;

            // Action to close success state
            document.getElementById('btn-done-close').addEventListener('click', () => {
                rsvpModal.classList.remove('open');
                document.body.style.overflow = '';
                // Restore form HTML structure for next open
                setTimeout(() => {
                    modalContent.innerHTML = originalHTML;
                    // Reattach event listener to form after restore
                    window.location.reload(); // Quick way to ensure all event listeners are fresh and clean
                }, 500);
            });
        });
    }

    // ==================== SECRET ADMIN PANEL ACCESS ====================
    const devLogoTrigger = document.getElementById('dev-logo-trigger');
    let clickCount = 0;
    let clickTimer;

    if (devLogoTrigger) {
        devLogoTrigger.addEventListener('click', () => {
            clickCount++;
            
            // Show dynamic feedback console logs for dev verification
            console.log(`Logo clicked: ${clickCount}/5`);
            
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 3000); // Reset clicks after 3 seconds of inactivity

            if (clickCount >= 5) {
                clickCount = 0;
                openAdminDashboard();
            }
        });
    }

    function openAdminDashboard() {
        const rsvpList = JSON.parse(localStorage.getItem('rsvp_responses')) || [];
        
        // Update stats
        let total = rsvpList.length;
        let attending = rsvpList.filter(item => item.status === 'attending').length;
        let absent = rsvpList.filter(item => item.status === 'absent').length;
        let totalGuests = rsvpList.reduce((acc, item) => acc + (item.status === 'attending' ? item.guests : 0), 0);

        document.getElementById('stat-total').innerText = total;
        document.getElementById('stat-attending').innerText = attending;
        document.getElementById('stat-absent').innerText = absent;
        document.getElementById('stat-guests').innerText = totalGuests;

        // Render Table Body
        const tableBody = document.getElementById('admin-table-body');
        tableBody.innerHTML = '';

        if (rsvpList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">لا توجد أي تأكيدات حضور بعد.</td></tr>`;
        } else {
            // Sort by latest timestamp first
            rsvpList.reverse().forEach(rsvp => {
                const tr = document.createElement('tr');
                const statusLabel = rsvp.status === 'attending' ? 'مؤكد الحضور' : 'معتذر';
                const statusClass = rsvp.status === 'attending' ? 'status-tag attending' : 'status-tag absent';
                
                tr.innerHTML = `
                    <td style="font-weight: 600;">${escapeHTML(rsvp.name)}</td>
                    <td><span class="${statusClass}">${statusLabel}</span></td>
                    <td>${rsvp.status === 'attending' ? rsvp.guests : '-'}</td>
                    <td style="font-size: 0.85rem; max-width: 250px; white-space: normal; word-break: break-word;">${escapeHTML(rsvp.message || '')}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${rsvp.timestamp || '-'}</td>
                `;
                tableBody.appendChild(tr);
            });
        }

        // Open Modal
        adminModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    // Helper function to escape HTML string injection
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // ==================== CSV EXPORT & CLEAR DATABASE ====================
    const btnDownloadCSV = document.getElementById('btn-download-csv');
    const btnClearDB = document.getElementById('btn-clear-db');

    if (btnDownloadCSV) {
        btnDownloadCSV.addEventListener('click', () => {
            const rsvpList = JSON.parse(localStorage.getItem('rsvp_responses')) || [];
            if (rsvpList.length === 0) {
                alert('لا توجد بيانات لتحميلها!');
                return;
            }

            // Create CSV header & rows (Excel needs UTF-8 BOM to display Arabic characters properly!)
            let csvContent = "\uFEFF"; // UTF-8 BOM
            csvContent += "الاسم,حالة الحضور,عدد المرافقين,الرسالة التهنئة,تاريخ التسجيل\n";

            rsvpList.forEach(rsvp => {
                const statusLabel = rsvp.status === 'attending' ? 'حاضر' : 'معتذر';
                const guests = rsvp.status === 'attending' ? rsvp.guests : 0;
                // Escape commas and quotes for CSV
                const cleanName = `"${(rsvp.name || '').replace(/"/g, '""')}"`;
                const cleanMsg = `"${(rsvp.message || '').replace(/"/g, '""')}"`;
                const cleanTime = `"${(rsvp.timestamp || '').replace(/"/g, '""')}"`;
                
                csvContent += `${cleanName},${statusLabel},${guests},${cleanMsg},${cleanTime}\n`;
            });

            // Trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `تأكيدات_حضور_زفاف_محمد_ورؤى.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    if (btnClearDB) {
        btnClearDB.addEventListener('click', () => {
            const rsvpList = JSON.parse(localStorage.getItem('rsvp_responses')) || [];
            if (rsvpList.length === 0) return;

            if (confirm('هل أنت متأكد من مسح جميع تأكيدات الحضور؟ لا يمكن التراجع عن هذا الإجراء.')) {
                localStorage.removeItem('rsvp_responses');
                // Refresh table
                openAdminDashboard();
            }
        });
    }
});
