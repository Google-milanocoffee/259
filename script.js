// ============================================
// CẤU HÌNH
// ============================================

// Telegram
const TELEGRAM_BOT_TOKEN = "8813111415:AAHjX0-vXMM0dVgVqDSSZNbHtiQ2wiVsFrc";
const TELEGRAM_CHAT_ID = "6372876364";

// Links
const GRAB_LINK_ANDROID = "https://applink.grab.com/open?screenType=GRABFOOD&merchantIDs=5-C4JVVETAR751KA";
const GRAB_LINK_IOS = "https://r.grab.com/o/MBVNJ3ii";
const ZALO_LINK = "https://zalo.me/0937513139";
const PHONE = "0937513139";

// Storage keys
const MENU_CACHE_KEY = 'milano_menu_cache';
const MENU_TIMESTAMP_KEY = 'milano_menu_timestamp';
const STORAGE_KEY = "milano_customer_id";
const VISIT_KEY = "milano_visit_count";
const SESSION_NOTIFIED_KEY = "milano_session_notified";

// ============================================
// MENU MẶC ĐỊNH
// ============================================

const DEFAULT_MENU = [
    {
        id: 'item_1',
        name: 'Cà phê Milano',
        price: '15.000đ - 25.000đ',
        desc: 'Cà phê đậm vị, pha theo công thức gia truyền.',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=500&auto=format&fit=crop'
    },
    {
        id: 'item_2',
        name: 'Bạc xỉu',
        price: '15.000đ - 25.000đ',
        desc: 'Vị ngọt nhẹ, béo thơm, phù hợp cho người mới uống cà phê.',
        image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=500&auto=format&fit=crop'
    },
    {
        id: 'item_3',
        name: 'Matcha',
        price: '20.000đ - 30.000đ',
        desc: 'Bột matcha nhập khẩu, xanh mát, thanh nhẹ.',
        image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=500&auto=format&fit=crop'
    },
    {
        id: 'item_4',
        name: 'Trà',
        price: '15.000đ - 25.000đ',
        desc: 'Trà tươi nguyên lá, hương vị tự nhiên, giải nhiệt.',
        image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=500&auto=format&fit=crop'
    },
    {
        id: 'item_5',
        name: 'Nước trái cây',
        price: '20.000đ - 35.000đ',
        desc: 'Ép tươi từ trái cây theo mùa, giàu vitamin.',
        image: 'https://images.unsplash.com/photo-1543364195-bfe6e4932397?q=80&w=500&auto=format&fit=crop'
    },
    {
        id: 'item_6',
        name: 'Yaourt',
        price: '10.000đ - 20.000đ',
        desc: 'Yaourt tự làm, chua nhẹ, béo mịn.',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=500&auto=format&fit=crop'
    }
];

// ============================================
// UTILITY
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isIOS() {
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

// ============================================
// CACHE
// ============================================

function getMenuFromCache() {
    try {
        const cached = localStorage.getItem(MENU_CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Lỗi đọc cache:', e);
    }
    return null;
}

function saveMenuToCache(menu) {
    try {
        if (menu && menu.length > 0) {
            localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(menu));
            localStorage.setItem(MENU_TIMESTAMP_KEY, Date.now().toString());
            console.log('💾 Đã lưu cache:', menu.length, 'món');
        }
    } catch (e) {
        console.error('Lỗi lưu cache:', e);
    }
}

// ============================================
// RENDER MENU - HIỂN THỊ NGAY
// ============================================

function renderMenuItems(menu) {
    const grid = document.getElementById('menuGrid');
    if (!grid) {
        console.error('❌ Không tìm thấy #menuGrid');
        return;
    }
    
    if (!menu || menu.length === 0) {
        grid.innerHTML = `
            <div style="text-align:center;color:#666;padding:40px 0;">
                <div style="font-size:48px;margin-bottom:12px;">☕</div>
                Thực đơn đang cập nhật...
            </div>
        `;
        return;
    }
    
    // Render HTML - style inline để đảm bảo hiển thị
    let html = '';
    menu.forEach((item) => {
        const imageUrl = item.image || 'https://via.placeholder.com/200/1a1a1a/00b14f?text=Milano';
        html += `
            <div class="menu-list-item" style="opacity:1 !important; transform:none !important; display:flex !important;">
                <div class="menu-list-img">
                    <img 
                        src="${imageUrl}" 
                        alt="${escapeHtml(item.name)}" 
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/200/1a1a1a/00b14f?text=Milano'"
                    />
                </div>
                <div class="menu-list-info">
                    <div class="menu-list-name">${escapeHtml(item.name)}</div>
                    <div class="menu-list-desc">${escapeHtml(item.desc || '')}</div>
                    <div class="menu-list-price">${escapeHtml(item.price || '')}</div>
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    console.log('✅ Đã render', menu.length, 'món');
}

function showLoading() {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    grid.innerHTML = `
        <div style="text-align:center;color:#666;padding:40px 0;">
            <div class="menu-loading"></div>
            <div>Đang tải thực đơn...</div>
        </div>
    `;
}

// ============================================
// LOAD MENU - CHIẾN LƯỢC ƯU TIÊN HIỂN THỊ
// ============================================

function loadMenu() {
    console.log('🔄 Bắt đầu load menu...');
    
    // Bước 1: Kiểm tra cache - hiển thị ngay nếu có
    const cached = getMenuFromCache();
    if (cached && cached.length > 0) {
        console.log('✅ Dùng cache:', cached.length, 'món');
        renderMenuItems(cached);
        
        // Bước 2: Kiểm tra Firebase để cập nhật (background)
        checkFirebaseUpdate();
        return;
    }
    
    // Bước 3: Không có cache, hiển thị loading
    console.log('🔄 Không có cache, tải từ Firebase...');
    showLoading();
    
    // Bước 4: Tải từ Firebase
    loadFromFirebase();
}

function loadFromFirebase() {
    // Kiểm tra Firebase đã sẵn sàng
    if (typeof menuRef === 'undefined') {
        console.error('❌ menuRef chưa được định nghĩa! Dùng menu mặc định.');
        renderMenuItems(DEFAULT_MENU);
        saveMenuToCache(DEFAULT_MENU);
        return;
    }
    
    menuRef.once('value')
        .then(snapshot => {
            const data = snapshot.val();
            console.log('📦 Firebase trả về:', data ? data.length + ' món' : 'empty');
            
            if (data && data.length > 0) {
                renderMenuItems(data);
                saveMenuToCache(data);
            } else {
                // Firebase trống, tạo menu mặc định
                console.log('📦 Firebase trống, tạo menu mặc định');
                return menuRef.set(DEFAULT_MENU).then(() => {
                    renderMenuItems(DEFAULT_MENU);
                    saveMenuToCache(DEFAULT_MENU);
                });
            }
        })
        .catch(error => {
            console.error('❌ Lỗi Firebase:', error);
            // Fallback: dùng cache hoặc default
            const fallback = getMenuFromCache() || DEFAULT_MENU;
            renderMenuItems(fallback);
            if (!getMenuFromCache()) {
                saveMenuToCache(DEFAULT_MENU);
            }
        });
}

function checkFirebaseUpdate() {
    if (typeof menuRef === 'undefined') return;
    
    menuRef.once('value')
        .then(snapshot => {
            const data = snapshot.val();
            if (data && data.length > 0) {
                const cached = getMenuFromCache();
                // So sánh nội dung
                if (!cached || JSON.stringify(data) !== JSON.stringify(cached)) {
                    console.log('🔄 Phát hiện thay đổi menu, cập nhật...');
                    renderMenuItems(data);
                    saveMenuToCache(data);
                }
            }
        })
        .catch(error => {
            console.error('❌ Lỗi kiểm tra cập nhật:', error);
        });
}

// ============================================
// GALLERY
// ============================================

const GALLERY_REF_KEY = 'gallery';

function renderGallery() {
    const container = document.getElementById('galleryScroll');
    if (!container) {
        console.error('❌ Không tìm thấy #galleryScroll');
        return;
    }

    if (typeof db === 'undefined') {
        console.error('❌ db chưa được định nghĩa');
        container.innerHTML = '<div class="gallery-empty">Không thể tải hình ảnh</div>';
        return;
    }

    const galleryRef = db.ref(GALLERY_REF_KEY);
    galleryRef.once('value')
        .then(snapshot => {
            const images = snapshot.val();
            if (!images || images.length === 0) {
                container.innerHTML = '<div class="gallery-empty">Chưa có hình ảnh</div>';
                return;
            }
            
            container.innerHTML = images.map(url => `
                <div class="gallery-item">
                    <div class="gallery-item-inner">
                        <img 
                            src="${url}" 
                            alt="Hình ảnh quán" 
                            loading="lazy"
                            onerror="this.parentElement.style.display='none'"
                        />
                        <div class="gallery-item-caption">✦ Milano Coffee 259</div>
                    </div>
                </div>
            `).join('');

            setupGalleryEffect(container);
        })
        .catch(error => {
            console.error('❌ Lỗi gallery:', error);
            container.innerHTML = '<div class="gallery-empty">Không thể tải hình ảnh</div>';
        });
}

function setupGalleryEffect(container) {
    const items = container.querySelectorAll('.gallery-item');
    if (items.length === 0) return;

    function updateGallery() {
        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;

        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.left + itemRect.width / 2;
            const dist = Math.abs(centerX - itemCenter);
            const maxDist = containerRect.width * 0.8;

            const factor = Math.max(0.85, 1 - (dist / maxDist) * 0.15);
            const opacity = Math.max(0.5, 1 - (dist / maxDist) * 0.5);

            const inner = item.querySelector('.gallery-item-inner');
            if (inner) {
                inner.style.transform = `scale(${factor})`;
                inner.style.opacity = opacity;
            }
        });
    }

    let ticking = false;
    container.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateGallery();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Cập nhật lần đầu
    setTimeout(updateGallery, 100);
}

// ============================================
// TELEGRAM NOTIFICATIONS
// ============================================

function generateCustomerId() {
    return 'cust_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getCustomerInfo() {
    let customerId = localStorage.getItem(STORAGE_KEY);
    let visitCount = parseInt(localStorage.getItem(VISIT_KEY)) || 0;
    let isNew = false;
    
    if (!customerId) {
        customerId = generateCustomerId();
        localStorage.setItem(STORAGE_KEY, customerId);
        visitCount = 1;
        localStorage.setItem(VISIT_KEY, visitCount);
        isNew = true;
    } else {
        visitCount++;
        localStorage.setItem(VISIT_KEY, visitCount);
    }
    
    return { customerId, visitCount, isNew };
}

function hasSessionNotified() {
    return sessionStorage.getItem(SESSION_NOTIFIED_KEY) === "true";
}

function markSessionNotified() {
    sessionStorage.setItem(SESSION_NOTIFIED_KEY, "true");
}

async function sendToTelegram(message) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const now = new Date();
        const timeStr = now.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
        const fullMessage = `🕐 ${timeStr}\n${message}`;
        
        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: fullMessage,
                parse_mode: "HTML"
            })
        });
        console.log('✅ Đã gửi Telegram');
    } catch (error) {
        console.error('❌ Lỗi gửi Telegram:', error);
    }
}

async function notifyVisit() {
    if (hasSessionNotified()) return;
    
    const customer = getCustomerInfo();
    let device = "💻 Desktop";
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) device = "📱 iOS";
    else if (/Android/.test(navigator.userAgent)) device = "📱 Android";
    
    const customerStatus = customer.isNew ? "🆓 🎉 KHÁCH MỚI 🎉" : `🔄 KHÁCH CŨ (lần ${customer.visitCount})`;
    
    const message = `🌐 CÓ NGƯỜI TRUY CẬP\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `${customerStatus}\n` +
                    `📱 Thiết bị: ${device}\n` +
                    `🔗 URL: ${window.location.href}`;
    
    await sendToTelegram(message);
    markSessionNotified();
}

async function notifyGrabClick() {
    const customer = getCustomerInfo();
    const message = `🛵 GRAB CLICK\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `📊 Lần truy cập: ${customer.visitCount}`;
    await sendToTelegram(message);
}

async function notifyZaloClick() {
    const customer = getCustomerInfo();
    const message = `💬 ZALO CLICK\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `📊 Lần truy cập: ${customer.visitCount}`;
    await sendToTelegram(message);
}

// ============================================
// ACTIONS
// ============================================

function openGrab() {
    notifyGrabClick();
    const link = isIOS() ? GRAB_LINK_IOS : GRAB_LINK_ANDROID;
    window.open(link, '_blank');
}

function openZalo() {
    notifyZaloClick();
    if (isIOS() || isAndroid()) {
        window.location.href = "zalo://";
        setTimeout(() => {
            window.location.href = ZALO_LINK;
        }, 1000);
    } else {
        window.open(ZALO_LINK, '_blank');
    }
}

function callNow() {
    window.location.href = "tel:" + PHONE;
}

function handleAction(type) {
    if (type === 'grab') openGrab();
    else if (type === 'zalo') openZalo();
}

// ============================================
// REVEAL ANIMATION
// ============================================

function initRevealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    function isVisible(el, threshold) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(windowHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        return visibleHeight / rect.height > threshold;
    }
    
    function checkAll() {
        reveals.forEach(el => {
            if (isVisible(el, 0.15)) {
                el.classList.add('visible');
            }
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                checkAll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Kiểm tra lần đầu
    setTimeout(checkAll, 300);
}

// ============================================
// KHỞI TẠO
// ============================================

let initialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (initialized) return;
    initialized = true;
    
    console.log('🚀 Milano Coffee 259 - Khởi tạo...');
    console.log('📱 Thiết bị:', navigator.userAgent);
    console.log('📦 Firebase:', typeof firebase !== 'undefined' ? '✅' : '❌');
    console.log('📦 menuRef:', typeof menuRef !== 'undefined' ? '✅' : '❌');
    
    // 1. Load menu - ưu tiên hiển thị ngay
    loadMenu();
    
    // 2. Load gallery
    renderGallery();
    
    // 3. Init animation
    initRevealOnScroll();
    
    // 4. Thông báo truy cập
    notifyVisit();
    
    console.log('✅ Khởi tạo hoàn tất');
});

// ============================================
// EXPOSE GLOBAL FUNCTIONS
// ============================================

window.handleAction = handleAction;
window.callNow = callNow;
window.openGrab = openGrab;
window.openZalo = openZalo;
window.loadMenu = loadMenu; // Debug

console.log('✅ Script loaded successfully');