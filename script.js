// ============================================
// CẤU HÌNH
// ============================================

const TELEGRAM_BOT_TOKEN = "8813111415:AAHjX0-vXMM0dVgVqDSSZNbHtiQ2wiVsFrc";
const TELEGRAM_CHAT_ID = "6372876364";

const GRAB_LINK_ANDROID = "https://applink.grab.com/open?screenType=GRABFOOD&merchantIDs=5-C4JVVETAR751KA";
const GRAB_LINK_IOS = "https://r.grab.com/o/MBVNJ3ii";
const ZALO_LINK = "https://zalo.me/0937513139";
const PHONE = "0937513139";

// Storage keys (MENU_VERSION_KEY & GALLERY_VERSION_KEY are defined in firebase-config.js)
const MENU_CACHE_KEY = 'milano_menu_cache';
const GALLERY_CACHE_KEY = 'milano_gallery_cache';
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
// VERSION MANAGEMENT
// ============================================

function getSavedVersion(key) {
    try {
        return localStorage.getItem(key) || '0';
    } catch {
        return '0';
    }
}

function saveVersion(key, version) {
    try {
        localStorage.setItem(key, String(version));
    } catch {}
}

function getFromCache(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function saveToCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch {}
}

// ============================================
// CHECK VERSION - CHỈ TẢI KHI CÓ THAY ĐỔI
// ============================================

function checkVersionAndLoad() {
    console.log('🔍 Kiểm tra version...');
    
    // Kiểm tra menu
    const savedMenuVersion = getSavedVersion(MENU_VERSION_KEY);
    const savedGalleryVersion = getSavedVersion(GALLERY_VERSION_KEY);
    
    // Lấy version từ Firebase
    if (typeof versionRef !== 'undefined') {
        versionRef.once('value').then(snapshot => {
            const versions = snapshot.val() || {};
            const firebaseMenuVersion = versions.menu || 0;
            const firebaseGalleryVersion = versions.gallery || 0;
            
            console.log('📦 Menu version:', savedMenuVersion, '→', firebaseMenuVersion);
            console.log('📦 Gallery version:', savedGalleryVersion, '→', firebaseGalleryVersion);
            
            // So sánh menu
            if (String(firebaseMenuVersion) !== String(savedMenuVersion)) {
                console.log('🔄 Menu có thay đổi, tải mới...');
                loadMenuFromFirebase();
            } else {
                console.log('✅ Menu không đổi, dùng cache');
                const cached = getFromCache(MENU_CACHE_KEY);
                if (cached) {
                    renderMenuItems(cached);
                } else {
                    loadMenuFromFirebase();
                }
            }
            
            // So sánh gallery
            if (String(firebaseGalleryVersion) !== String(savedGalleryVersion)) {
                console.log('🔄 Gallery có thay đổi, tải mới...');
                loadGalleryFromFirebase();
            } else {
                console.log('✅ Gallery không đổi, dùng cache');
                const cached = getFromCache(GALLERY_CACHE_KEY);
                if (cached) {
                    renderGalleryItems(cached);
                } else {
                    loadGalleryFromFirebase();
                }
            }
        }).catch(() => {
            // Fallback: load từ Firebase nếu lỗi
            console.log('⚠️ Lỗi đọc version, tải từ Firebase...');
            loadMenuFromFirebase();
            loadGalleryFromFirebase();
        });
    } else {
        // Fallback
        loadMenuFromFirebase();
        loadGalleryFromFirebase();
    }
}

// ============================================
// MENU - LOAD TỪ FIREBASE
// ============================================

function loadMenuFromFirebase() {
    if (typeof menuRef === 'undefined') {
        renderMenuItems(DEFAULT_MENU);
        return;
    }
    
    console.log('🔄 Tải menu từ Firebase...');
    showLoading();
    
    menuRef.once('value').then(snapshot => {
        const data = snapshot.val();
        
        if (data && data.length > 0) {
            renderMenuItems(data);
            saveToCache(MENU_CACHE_KEY, data);
            // Cập nhật version
            versionRef.once('value').then(vs => {
                const versions = vs.val() || {};
                if (versions.menu) {
                    saveVersion(MENU_VERSION_KEY, versions.menu);
                }
            });
        } else {
            // Tạo mặc định
            menuRef.set(DEFAULT_MENU).then(() => {
                renderMenuItems(DEFAULT_MENU);
                saveToCache(MENU_CACHE_KEY, DEFAULT_MENU);
                versionRef.update({ menu: Date.now() });
            });
        }
    }).catch(error => {
        console.error('❌ Lỗi tải menu:', error);
        const fallback = getFromCache(MENU_CACHE_KEY) || DEFAULT_MENU;
        renderMenuItems(fallback);
    });
}

// ============================================
// GALLERY - LOAD TỪ FIREBASE
// ============================================

function loadGalleryFromFirebase() {
    if (typeof db === 'undefined') {
        renderGalleryItems([]);
        return;
    }
    
    console.log('🔄 Tải gallery từ Firebase...');
    
    const galleryRef = db.ref('gallery');
    galleryRef.once('value').then(snapshot => {
        const data = snapshot.val() || [];
        
        renderGalleryItems(data);
        saveToCache(GALLERY_CACHE_KEY, data);
        // Cập nhật version
        versionRef.once('value').then(vs => {
            const versions = vs.val() || {};
            if (versions.gallery) {
                saveVersion(GALLERY_VERSION_KEY, versions.gallery);
            }
        });
    }).catch(error => {
        console.error('❌ Lỗi tải gallery:', error);
        const fallback = getFromCache(GALLERY_CACHE_KEY) || [];
        renderGalleryItems(fallback);
    });
}

// ============================================
// RENDER MENU
// ============================================

function renderMenuItems(menu) {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    
    if (!menu || menu.length === 0) {
        grid.innerHTML = `
            <div style="text-align:center;color:#666;padding:40px 0;">
                <div style="font-size:48px;margin-bottom:12px;">☕</div>
                Thực đơn đang cập nhật...
            </div>
        `;
        return;
    }
    
    let html = '';
    menu.forEach((item) => {
        const imageUrl = item.image || 'https://via.placeholder.com/200/1a1a1a/00b14f?text=Milano';
        html += `
            <div class="menu-list-item reveal">
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
// RENDER GALLERY
// ============================================

function renderGalleryItems(images) {
    const container = document.getElementById('galleryScroll');
    if (!container) return;
    
    if (!images || images.length === 0) {
        container.innerHTML = '<div class="gallery-empty">Chưa có hình ảnh</div>';
        return;
    }
    
    // Chỉ hiển thị 10 ảnh mới nhất
    const displayImages = images.slice(-10).reverse();
    
    container.innerHTML = displayImages.map((url, index) => `
        <div class="gallery-item">
            <div class="gallery-item-inner">
                <img
                    src="${url}"
                    alt="Hình ảnh quán"
                    loading="${index < 3 ? 'eager' : 'lazy'}"
                    decoding="async"
                    onerror="this.parentElement.style.display='none'"
                    style="background:#1a1a1a; min-height:200px;"
                />
                <div class="gallery-item-caption">✦ Milano Coffee 259</div>
            </div>
        </div>
    `).join('');

    setupGalleryEffect(container);
    console.log('✅ Đã render', displayImages.length, 'ảnh gallery');
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
    } catch (error) {
        console.error('Lỗi gửi Telegram:', error);
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
// REVEAL ON SCROLL - HIỆU ỨNG LIÊN TỤC KHI CUỘN (cả 2 chiều)
// ============================================

function initRevealOnScroll() {
    // Danh sách các class reveal cần theo dõi
    const revealSelectors = [
        '.reveal', '.reveal-left', '.reveal-right', '.reveal-scale',
        '.menu-list-item', '.gallery-item',
        '.section-title', '.section-title-sm', '.section-desc',
        '.info-card', '.trust-card', '.map'
    ];
    
    // IntersectionObserver - toggle visible liên tục (cả vào và ra)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -20px 0px'
    });
    
    // Observe tất cả các element hiện tại
    document.querySelectorAll(revealSelectors.join(',')).forEach(el => {
        observer.observe(el);
    });
    
    // Observe các element mới được thêm vào (cho menu/gallery render động)
    const mutationObs = new MutationObserver(() => {
        document.querySelectorAll(revealSelectors.join(',')).forEach(el => {
            // Kiểm tra nếu chưa được observe (bằng cách check không có visible class do observer)
            // Cách đơn giản: observe tất cả, observer sẽ bỏ qua element đã được observe
            try { observer.observe(el); } catch(e) {}
        });
    });
    mutationObs.observe(document.body, { childList: true, subtree: true });
    
    // Chạy lần đầu để bắt các element đã visible ngay từ đầu
    setTimeout(() => {
        document.querySelectorAll(revealSelectors.join(',')).forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(windowHeight, rect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            if (visibleHeight / rect.height > 0.15) {
                el.classList.add('visible');
            } else {
                el.classList.remove('visible');
            }
        });
    }, 150);
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
    console.log('📦 versionRef:', typeof versionRef !== 'undefined' ? '✅' : '❌');
    
    // 1. Kiểm tra version và tải dữ liệu (chỉ 1 lần khi load)
    checkVersionAndLoad();
    
    // 2. Init animation - hiệu ứng cuộn mượt
    initRevealOnScroll();
    
    // 3. Thông báo truy cập
    setTimeout(notifyVisit, 1000);
    
    console.log('✅ Khởi tạo hoàn tất! 🚀');
});

// ============================================
// EXPOSE GLOBAL FUNCTIONS
// ============================================

window.handleAction = handleAction;
window.callNow = callNow;
window.openGrab = openGrab;
window.openZalo = openZalo;

console.log('✅ Script loaded - Version mode 🔥');
