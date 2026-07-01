// ========== TELEGRAM CONFIG ==========
const TELEGRAM_BOT_TOKEN = "8813111415:AAHjX0-vXMM0dVgVqDSSZNbHtiQ2wiVsFrc";
const TELEGRAM_CHAT_ID = "6372876364";

// ========== LẤY MENU REF TỪ FIREBASE ==========
const menuRef = firebase.database().ref('menu');

// ========== LINKS ==========
const GRAB_LINK_ANDROID = "https://applink.grab.com/open?screenType=GRABFOOD&merchantIDs=5-C4JVVETAR751KA";
const GRAB_LINK_IOS = "https://r.grab.com/o/MBVNJ3ii";
const ZALO_LINK = "https://zalo.me/0937513139";
const PHONE = "0937513139";

// ========== LƯU THÔNG TIN KHÁCH ==========
const STORAGE_KEY = "milano_customer_id";
const VISIT_KEY = "milano_visit_count";

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

// ========== GIỚI HẠN THÔNG BÁO THEO PHIÊN ==========
const SESSION_NOTIFIED_KEY = "milano_session_notified";

function hasSessionNotified() {
    return sessionStorage.getItem(SESSION_NOTIFIED_KEY) === "true";
}

function markSessionNotified() {
    sessionStorage.setItem(SESSION_NOTIFIED_KEY, "true");
}

// ========== GỬI THÔNG BÁO TELEGRAM ==========
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
            console.error("❌ Lỗi:", result);
        }
    } catch (error) {
        console.error("❌ Lỗi gửi Telegram:", error);
    }
}

// ========== THÔNG BÁO LẦN ĐẦU ==========
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
    
    let customerStatus = customer.isNew ? "🆓 🎉 **KHÁCH MỚI** 🎉" : `🔄 **KHÁCH CŨ** (lần ${customer.visitCount})`;
    
    let message = `🌐 <b>🔴 CÓ NGƯỜI TRUY CẬP</b>\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `${customerStatus}\n` +
                  `📱 <b>Thiết bị:</b> ${device}\n` +
                  `🆔 <b>Mã KH:</b> <code>${customer.customerId.substring(0, 12)}...</code>\n` +
                  `🔗 <b>URL:</b> ${window.location.href}`;
    
    await sendToTelegram(message);
    markSessionNotified();
}

// ========== THÔNG BÁO CLICK GRAB ==========
async function notifyGrabClick() {
    const customer = getCustomerInfo();
    let message = `🛵 <b>GRAB CLICK</b>\n━━━━━━━━━━━━━━━━\n🆔 <b>KH:</b> ${customer.customerId.substring(0, 12)}...\n📊 <b>Lần truy cập:</b> ${customer.visitCount}`;
    await sendToTelegram(message);
}

// ========== THÔNG BÁO CLICK ZALO ==========
async function notifyZaloClick() {
    const customer = getCustomerInfo();
    let message = `💬 <b>ZALO CLICK</b>\n━━━━━━━━━━━━━━━━\n🆔 <b>KH:</b> ${customer.customerId.substring(0, 12)}...\n📊 <b>Lần truy cập:</b> ${customer.visitCount}`;
    await sendToTelegram(message);
}

// ========== THÔNG BÁO GỌI ĐIỆN ==========
async function notifyCallClick() {
    const customer = getCustomerInfo();
    let message = `📞 <b>CALL CLICK</b>\n━━━━━━━━━━━━━━━━\n🆔 <b>KH:</b> ${customer.customerId.substring(0, 12)}...\n📊 <b>Lần truy cập:</b> ${customer.visitCount}`;
    await sendToTelegram(message);
}

// ========== PHÁT HIỆN THIẾT BỊ ==========
function isIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent); }
function isAndroid() { return /Android/.test(navigator.userAgent); }

// ========== MỞ GRAB ==========
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
    setTimeout(() => { window.location.href = "https://grab.com/vn/"; }, 3000);
}

// ========== MỞ ZALO ==========
function openZalo() {
    notifyZaloClick();
    if (isIOS() || isAndroid()) {
        window.location.href = "zalo://";
        setTimeout(() => { window.location.href = ZALO_LINK; }, 1000);
    } else {
        window.location.href = ZALO_LINK;
    }
}

// ========== GỌI ĐIỆN ==========
function callNow() {
    notifyCallClick();
    window.location.href = "tel:" + PHONE;
}

// ========== HANDLE ACTION ==========
function handleAction(type) {
    if (type === 'grab') openGrab();
    else if (type === 'zalo') openZalo();
}

// ========== MENU DEFAULT ==========
const DEFAULT_MENU = [
    { id: 'item_1', name: 'Cà phê Milano', price: '15.000đ - 25.000đ', desc: 'Cà phê đậm vị, pha theo công thức gia truyền.', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=500&auto=format&fit=crop' },
    { id: 'item_2', name: 'Bạc xỉu', price: '15.000đ - 25.000đ', desc: 'Vị ngọt nhẹ, béo thơm, phù hợp cho người mới uống cà phê.', image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=500&auto=format&fit=crop' },
    { id: 'item_3', name: 'Matcha', price: '20.000đ - 30.000đ', desc: 'Bột matcha nhập khẩu, xanh mát, thanh nhẹ.', image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=500&auto=format&fit=crop' },
    { id: 'item_4', name: 'Trà', price: '15.000đ - 25.000đ', desc: 'Trà tươi nguyên lá, hương vị tự nhiên, giải nhiệt.', image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=500&auto=format&fit=crop' },
    { id: 'item_5', name: 'Nước trái cây', price: '20.000đ - 35.000đ', desc: 'Ép tươi từ trái cây theo mùa, giàu vitamin.', image: 'https://images.unsplash.com/photo-1543364195-bfe6e4932397?q=80&w=500&auto=format&fit=crop' },
    { id: 'item_6', name: 'Yaourt', price: '10.000đ - 20.000đ', desc: 'Yaourt tự làm, chua nhẹ, béo mịn.', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=500&auto=format&fit=crop' }
];

// ========== RENDER MENU ==========
function renderMenuGrid(menu) {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    if (!menu || menu.length === 0) {
        grid.innerHTML = '<div style="text-align:center;color:#666;padding:40px 0;">Thực đơn đang cập nhật...</div>';
        return;
    }
    grid.innerHTML = menu.map(item => `
        <div class="menu-list-item">
            <div class="menu-list-img">
                <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200?text=Milano'" />
            </div>
            <div class="menu-list-info">
                <div class="menu-list-name">${escapeHtml(item.name)}</div>
                <div class="menu-list-desc">${escapeHtml(item.desc)}</div>
                <div class="menu-list-price">${escapeHtml(item.price)}</div>
            </div>
        </div>
    `).join('');
    
    // Kích hoạt hiệu ứng xuất hiện
    setTimeout(() => {
        document.querySelectorAll('.menu-list-item').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 80);
        });
    }, 100);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderMenu() {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;

    grid.innerHTML = '<div style="text-align:center;color:#666;padding:40px 0;">Đang tải thực đơn...</div>';

    // Lắng nghe realtime từ Firebase
    menuRef.on('value', function(snapshot) {
        const menu = snapshot.val();
        if (menu && menu.length > 0) {
            renderMenuGrid(menu);
        } else {
            // Nếu chưa có dữ liệu, tạo mới
            menuRef.set(DEFAULT_MENU).then(() => {
                renderMenuGrid(DEFAULT_MENU);
            });
        }
    });
}

// ========== GALLERY REALTIME ==========
const GALLERY_REF_KEY = 'gallery';

function renderGallery() {
    const container = document.getElementById('galleryScroll');
    if (!container) return;

    const galleryRef = firebase.database().ref(GALLERY_REF_KEY);
    galleryRef.on('value', function(snapshot) {
        const images = snapshot.val();
        if (!images || images.length === 0) {
            container.innerHTML = '<div class="gallery-empty">Chưa có hình ảnh</div>';
            return;
        }
        container.innerHTML = images.map(function(url) {
            return '<div class="gallery-item">' +
                '<div class="gallery-item-inner">' +
                '<img src="' + url + '" alt="Hình ảnh quán" loading="lazy" onerror="this.parentElement.style.display=\'none\'" />' +
                '<div class="gallery-item-caption">&#10003; Milano Coffee 259</div>' +
                '</div>' +
                '</div>';
        }).join('');

        setupGalleryEffect(container);
    });
}

function setupGalleryEffect(container) {
    var items = container.querySelectorAll('.gallery-item');
    if (items.length === 0) return;

    function updateGallery() {
        var containerRect = container.getBoundingClientRect();
        var centerX = containerRect.left + containerRect.width / 2;
        items.forEach(function(item) {
            var itemRect = item.getBoundingClientRect();
            var itemCenter = itemRect.left + itemRect.width / 2;
            var dist = Math.abs(centerX - itemCenter);
            var maxDist = containerRect.width * 0.8;
            var factor = Math.max(0, 1 - (dist / maxDist) * 0.15);
            var opacity = Math.max(0.5, 1 - (dist / maxDist) * 0.5);
            var inner = item.querySelector('.gallery-item-inner');
            if (inner) {
                inner.style.transform = 'scale(' + factor + ')';
                inner.style.opacity = opacity;
            }
        });
    }

    var ticking = false;
    container.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateGallery();
                ticking = false;
            });
            ticking = true;
        }
    });
    updateGallery();
}

// ========== REVEAL ON SCROLL ==========
function initRevealOnScroll() {
    var reveals = document.querySelectorAll('.reveal');
    var menuItems = document.querySelectorAll('.menu-list-item');
    
    function isInViewport(el, threshold) {
        var rect = el.getBoundingClientRect();
        var windowHeight = window.innerHeight;
        var visibleTop = Math.max(0, rect.top);
        var visibleBottom = Math.min(windowHeight, rect.bottom);
        var visibleHeight = Math.max(0, visibleBottom - visibleTop);
        var percentVisible = visibleHeight / rect.height;
        return { visible: percentVisible > threshold };
    }
    
    function checkAll() {
        reveals.forEach(function(el) {
            var v = isInViewport(el, 0.15);
            if (v.visible) el.classList.add('visible');
            else el.classList.remove('visible');
        });
        menuItems.forEach(function(item, index) {
            var v = isInViewport(item, 0.05);
            if (v.visible) {
                setTimeout(function() { item.classList.add('visible'); }, index * 80);
            } else {
                item.classList.remove('visible');
            }
        });
    }

    var ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() { checkAll(); ticking = false; });
            ticking = true;
        }
    });
    checkAll();
}

// ========== KHỞI TẠO ==========
let hasNotified = false;
window.addEventListener("load", function() {
    renderMenu();
    renderGallery();
    initRevealOnScroll();
    
    if (!hasNotified) {
        hasNotified = true;
        notifyVisit();
    }
});