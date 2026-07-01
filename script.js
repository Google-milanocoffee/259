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

// Cache keys
const MENU_CACHE_KEY = 'milano_menu_cache';
const MENU_TIMESTAMP_KEY = 'milano_menu_timestamp';
const MENU_HASH_KEY = 'milano_menu_hash';
const STORAGE_KEY = "milano_customer_id";
const VISIT_KEY = "milano_visit_count";
const SESSION_NOTIFIED_KEY = "milano_session_notified";

// Cache thời gian 5 phút
const CACHE_DURATION = 5 * 60 * 1000;

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
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateHash(obj) {
    return JSON.stringify(obj).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0).toString(36);
}

function isIOS() {
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

// ============================================
// CACHE MANAGEMENT
// ============================================

function getMenuFromCache() {
    try {
        const cached = localStorage.getItem(MENU_CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) {
        console.error('Lỗi đọc cache:', e);
    }
    return null;
}

function saveMenuToCache(menu) {
    try {
        localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(menu));
        localStorage.setItem(MENU_TIMESTAMP_KEY, Date.now().toString());
        localStorage.setItem(MENU_HASH_KEY, generateHash(menu));
    } catch (e) {
        console.error('Lỗi lưu cache:', e);
    }
}

function getCachedHash() {
    try {
        return localStorage.getItem(MENU_HASH_KEY) || '';
    } catch (e) {
        return '';
    }
}

function isCacheValid() {
    try {
        const timestamp = localStorage.getItem(MENU_TIMESTAMP_KEY);
        if (!timestamp) return false;
        const elapsed = Date.now() - parseInt(timestamp);
        return elapsed < CACHE_DURATION;
    } catch (e) {
        return false;
    }
}

function isCacheExists() {
    return localStorage.getItem(MENU_CACHE_KEY) !== null;
}

// ============================================
// MENU RENDER
// ============================================

function renderMenuGrid(menu) {
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
    
    grid.innerHTML = menu.map((item, index) => `
        <div class="menu-list-item" style="transition-delay: ${Math.min(index * 50, 500)}ms">
            <div class="menu-list-img">
                <img 
                    src="${item.image}" 
                    alt="${escapeHtml(item.name)}" 
                    loading="lazy" 
                    onerror="this.src='https://via.placeholder.com/200/1a1a1a/00b14f?text=Milano'"
                />
            </div>
            <div class="menu-list-info">
                <div class="menu-list-name">${escapeHtml(item.name)}</div>
                <div class="menu-list-desc">${escapeHtml(item.desc)}</div>
                <div class="menu-list-price">${escapeHtml(item.price)}</div>
            </div>
        </div>
    `).join('');
}

function showLoadingState() {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    grid.innerHTML = `
        <div style="text-align:center;color:#666;padding:40px 0;">
            <div style="display:inline-block;width:40px;height:40px;border:3px solid #2c2c2c;border-top-color:#00b14f;border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:12px;"></div>
            <div>Đang tải thực đơn...</div>
            <style>
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
        </div>
    `;
}

function showUpdateStatus(message) {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    
    let status = document.getElementById('menu-status');
    if (!status) {
        status = document.createElement('div');
        status.id = 'menu-status';
        status.style.cssText = 'text-align:center;color:#888;font-size:12px;padding:8px 0;border-radius:8px;margin-top:8px;';
        grid.parentNode.insertBefore(status, grid.nextSibling);
    }
    status.textContent = message;
    status.style.display = 'block';
    
    if (message.includes('✅') || message.includes('Đã cập nhật')) {
        status.style.color = '#00b14f';
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
}

function hideUpdateStatus() {
    const status = document.getElementById('menu-status');
    if (status) {
        status.style.display = 'none';
    }
}

// ============================================
// MENU DATA MANAGEMENT
// ============================================

// Khởi tạo menu mặc định nếu Firebase trống
function initDefaultMenu() {
    return menuRef.once('value').then(snapshot => {
        if (!snapshot.exists()) {
            console.log('📦 Khởi tạo menu mặc định trên Firebase');
            return menuRef.set(DEFAULT_MENU).then(() => {
                saveMenuToCache(DEFAULT_MENU);
                return DEFAULT_MENU;
            });
        }
        const data = snapshot.val();
        if (data && data.length > 0) {
            // Cập nhật cache nếu khác
            const currentHash = generateHash(data);
            if (currentHash !== getCachedHash()) {
                saveMenuToCache(data);
            }
            return data;
        }
        return null;
    });
}

// Tải menu từ Firebase
function loadMenuFromFirebase(force = false) {
    return new Promise((resolve, reject) => {
        // Nếu không force và cache hợp lệ, trả về cache
        if (!force && isCacheValid()) {
            const cached = getMenuFromCache();
            if (cached) {
                console.log('✅ Dùng cache (còn hiệu lực)');
                renderMenuGrid(cached);
                resolve(cached);
                return;
            }
        }
        
        // Tải từ Firebase
        console.log('🔄 Tải menu từ Firebase...');
        showLoadingState();
        
        menuRef.once('value')
            .then(snapshot => {
                const menu = snapshot.val();
                
                if (menu && menu.length > 0) {
                    // Lưu cache
                    saveMenuToCache(menu);
                    renderMenuGrid(menu);
                    hideUpdateStatus();
                    console.log('✅ Đã tải menu từ Firebase');
                    resolve(menu);
                } else {
                    // Không có dữ liệu, dùng default
                    console.log('⚠️ Firebase trống, dùng menu mặc định');
                    return menuRef.set(DEFAULT_MENU).then(() => {
                        saveMenuToCache(DEFAULT_MENU);
                        renderMenuGrid(DEFAULT_MENU);
                        return DEFAULT_MENU;
                    });
                }
            })
            .catch(error => {
                console.error('❌ Lỗi tải menu:', error);
                // Fallback: dùng cache hoặc default
                const fallback = getMenuFromCache() || DEFAULT_MENU;
                renderMenuGrid(fallback);
                showUpdateStatus('⚠️ Đang sử dụng dữ liệu đã lưu');
                resolve(fallback);
            });
    });
}

// Kiểm tra cập nhật từ Firebase (so sánh hash)
function checkForMenuUpdate() {
    return menuRef.once('value').then(snapshot => {
        const menu = snapshot.val();
        if (!menu || menu.length === 0) return null;
        
        const newHash = generateHash(menu);
        const oldHash = getCachedHash();
        
        if (newHash !== oldHash) {
            console.log('🔄 Phát hiện thay đổi menu, cập nhật...');
            saveMenuToCache(menu);
            renderMenuGrid(menu);
            showUpdateStatus('✅ Đã cập nhật thực đơn mới nhất');
            return menu;
        }
        return null;
    });
}

// ============================================
// MENU - CHIẾN LƯỢC LOAD CHÍNH
// ============================================

function renderMenu() {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    
    // Bước 1: Kiểm tra cache
    const cachedMenu = getMenuFromCache();
    const cacheValid = isCacheValid();
    
    if (cachedMenu) {
        // Bước 2: Hiển thị cache ngay lập tức
        renderMenuGrid(cachedMenu);
        console.log('📱 Hiển thị menu từ cache');
        
        // Bước 3: Nếu cache không còn hiệu lực, tải mới
        if (!cacheValid) {
            console.log('⏳ Cache hết hạn, đang tải mới...');
            showUpdateStatus('⏳ Đang cập nhật thực đơn...');
            
            // Tải từ Firebase
            loadMenuFromFirebase(true).then(() => {
                hideUpdateStatus();
            });
        } else {
            // Cache còn hiệu lực, kiểm tra xem có thay đổi không (background)
            console.log('🔍 Kiểm tra cập nhật menu...');
            checkForMenuUpdate();
        }
    } else {
        // Bước 4: Không có cache, tải từ Firebase
        console.log('🔄 Không có cache, tải từ Firebase...');
        showLoadingState();
        loadMenuFromFirebase(true);
    }
}

// ============================================
// GALLERY
// ============================================

const GALLERY_REF_KEY = 'gallery';

function renderGallery() {
    const container = document.getElementById('galleryScroll');
    if (!container) return;

    const galleryRef = db.ref(GALLERY_REF_KEY);
    galleryRef.once('value').then(snapshot => {
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
    }).catch(error => {
        console.error('Lỗi tải gallery:', error);
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

    updateGallery();
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
        isNew = false;
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
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const now = new Date();
    const timeStr = now.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    const fullMessage = `🕐 ${timeStr}\n${message}`;
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: fullMessage,
                parse_mode: "HTML"
            })
        });
        const result = await response.json();
        if (result.ok) {
            console.log("✅ Đã gửi thông báo Telegram");
        } else {
            console.error("❌ Lỗi Telegram:", result);
        }
    } catch (error) {
        console.error("❌ Lỗi gửi Telegram:", error);
    }
}

async function notifyVisit() {
    if (hasSessionNotified()) {
        console.log("✅ Đã gửi thông báo trong phiên này");
        return;
    }
    
    const customer = getCustomerInfo();
    const userAgent = navigator.userAgent;
    let device = "💻 Desktop";
    
    if (/iPhone|iPad|iPod/.test(userAgent)) device = "📱 iOS";
    else if (/Android/.test(userAgent)) device = "📱 Android";
    
    const customerStatus = customer.isNew ? "🆓 🎉 **KHÁCH MỚI** 🎉" : `🔄 **KHÁCH CŨ** (lần ${customer.visitCount})`;
    
    const message = `🌐 <b>🔴 CÓ NGƯỜI TRUY CẬP</b>\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `${customerStatus}\n` +
                    `📱 <b>Thiết bị:</b> ${device}\n` +
                    `🆔 <b>Mã KH:</b> <code>${customer.customerId.substring(0, 12)}...</code>\n` +
                    `🔗 <b>URL:</b> ${window.location.href}`;
    
    await sendToTelegram(message);
    markSessionNotified();
}

async function notifyGrabClick() {
    const customer = getCustomerInfo();
    const message = `🛵 <b>GRAB CLICK</b>\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `🆔 <b>KH:</b> ${customer.customerId.substring(0, 12)}...\n` +
                    `📊 <b>Lần truy cập:</b> ${customer.visitCount}`;
    await sendToTelegram(message);
}

async function notifyZaloClick() {
    const customer = getCustomerInfo();
    const message = `💬 <b>ZALO CLICK</b>\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `🆔 <b>KH:</b> ${customer.customerId.substring(0, 12)}...\n` +
                    `📊 <b>Lần truy cập:</b> ${customer.visitCount}`;
    await sendToTelegram(message);
}

async function notifyCallClick() {
    const customer = getCustomerInfo();
    const message = `📞 <b>CALL CLICK</b>\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `🆔 <b>KH:</b> ${customer.customerId.substring(0, 12)}...\n` +
                    `📊 <b>Lần truy cập:</b> ${customer.visitCount}`;
    await sendToTelegram(message);
}

// ============================================
// ACTIONS
// ============================================

function openGrab() {
    notifyGrabClick();
    const link = isIOS() ? GRAB_LINK_IOS : GRAB_LINK_ANDROID;
    
    const a = document.createElement("a");
    a.href = link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => {
        window.location.href = "https://grab.com/vn/";
    }, 3000);
}

function openZalo() {
    notifyZaloClick();
    if (isIOS() || isAndroid()) {
        window.location.href = "zalo://";
        setTimeout(() => {
            window.location.href = ZALO_LINK;
        }, 1000);
    } else {
        window.location.href = ZALO_LINK;
    }
}

function callNow() {
    notifyCallClick();
    window.location.href = "tel:" + PHONE;
}

function handleAction(type) {
    if (type === 'grab') {
        openGrab();
    } else if (type === 'zalo') {
        openZalo();
    }
}

// ============================================
// REVEAL ANIMATION
// ============================================

function initRevealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    const menuItems = document.querySelectorAll('.menu-list-item');
    
    function isInViewport(el, threshold) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(windowHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const percentVisible = visibleHeight / rect.height;
        return percentVisible > threshold;
    }
    
    function checkAll() {
        reveals.forEach(el => {
            if (isInViewport(el, 0.15)) {
                el.classList.add('visible');
            } else {
                el.classList.remove('visible');
            }
        });
        
        menuItems.forEach((item, index) => {
            if (isInViewport(item, 0.05)) {
                setTimeout(() => {
                    item.classList.add('visible');
                }, index * 80);
            } else {
                item.classList.remove('visible');
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
    
    checkAll();
}

// ============================================
// KHỞI TẠO
// ============================================

let isInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('🚀 Milano Coffee 259 - Đang khởi tạo...');
    
    // 1. Khởi tạo menu mặc định nếu cần
    initDefaultMenu().then(() => {
        // 2. Render menu với chiến lược cache
        renderMenu();
    });
    
    // 3. Render gallery
    renderGallery();
    
    // 4. Khởi tạo hiệu ứng scroll
    initRevealOnScroll();
    
    // 5. Gửi thông báo truy cập
    notifyVisit();
    
    console.log('✅ Milano Coffee 259 - Khởi tạo hoàn tất');
});

// ============================================
// EXPOSE FUNCTIONS GLOBAL (cho HTML onclick)
// ============================================

window.handleAction = handleAction;
window.callNow = callNow;
window.openGrab = openGrab;
window.openZalo = openZalo;