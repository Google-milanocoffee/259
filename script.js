const GRAB_LINK = "https://r.grab.com/o/MBVNJ3ii";
const ZALO_LINK = "https://zalo.me/0937513139";
const PHONE = "0937513139";

// ========== TELEGRAM CONFIG ==========
const TELEGRAM_BOT_TOKEN = "8246719122:AAH8CDUFWOP1xeMpZ4hi8uwQHlqzTfBSSh4";
const TELEGRAM_CHAT_ID = "6372876364";
// ======================================

// ========== PHÂN BIỆT KHÁCH HÀNG ==========
const STORAGE_KEY = "milano_customer_id";
const VISIT_KEY = "milano_visit_count";

function generateCustomerId() {
    return 'cust_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getOrCreateCustomerId() {
    let customerId = localStorage.getItem(STORAGE_KEY);
    let visitCount = parseInt(localStorage.getItem(VISIT_KEY)) || 0;
    
    if (!customerId) {
        customerId = generateCustomerId();
        localStorage.setItem(STORAGE_KEY, customerId);
        visitCount = 1;
        localStorage.setItem(VISIT_KEY, visitCount);
        return { customerId, visitCount, isNew: true };
    } else {
        visitCount++;
        localStorage.setItem(VISIT_KEY, visitCount);
        return { customerId, visitCount, isNew: false };
    }
}

function getCustomerInfo() {
    const { customerId, visitCount, isNew } = getOrCreateCustomerId();
    let firstVisit = localStorage.getItem("milano_first_visit");
    if (!firstVisit && isNew) {
        firstVisit = new Date().toISOString();
        localStorage.setItem("milano_first_visit", firstVisit);
    }
    return {
        customerId: customerId,
        visitCount: visitCount,
        isNew: isNew,
        firstVisit: firstVisit || "unknown"
    };
}

// ========== GIỚI HẠN THÔNG BÁO THEO PHIÊN ==========
const SESSION_KEY = "milano_session_id";
const SESSION_NOTIFIED_KEY = "milano_session_notified";

function getOrCreateSession() {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    let hasNotified = sessionStorage.getItem(SESSION_NOTIFIED_KEY) === "true";
    
    if (!sessionId) {
        sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        sessionStorage.setItem(SESSION_KEY, sessionId);
        sessionStorage.setItem(SESSION_NOTIFIED_KEY, "false");
        hasNotified = false;
    }
    
    return { sessionId, hasNotified };
}

function markSessionNotified() {
    sessionStorage.setItem(SESSION_NOTIFIED_KEY, "true");
}

function hasSessionNotified() {
    return sessionStorage.getItem(SESSION_NOTIFIED_KEY) === "true";
}

// ========== CHỈ HỎI VỊ TRÍ 1 LẦN DUY NHẤT TRONG PHIÊN ==========
let hasAskedLocation = false;
let cachedLocation = null;
let locationDenied = false;

async function getLocationOnce() {
    if (locationDenied) {
        console.log("📍 Khách đã từ chối vị trí trong phiên này");
        return null;
    }
    
    if (cachedLocation !== null) {
        console.log("📍 Dùng vị trí đã lưu trong phiên");
        return cachedLocation;
    }
    
    if (!hasAskedLocation) {
        hasAskedLocation = true;
        console.log("📍 Lần đầu hỏi vị trí trong phiên này");
        const location = await getLocation();
        
        if (location) {
            cachedLocation = location;
            return location;
        } else {
            locationDenied = true;
            return null;
        }
    }
    
    return null;
}

function resetLocationState() {
    hasAskedLocation = false;
    cachedLocation = null;
    locationDenied = false;
}

// Hàm lấy vị trí gốc
function getLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                console.log("Người dùng từ chối chia sẻ vị trí:", error.message);
                resolve(null);
            }
        );
    });
}

// ========== CÁC HÀM TIỆN ÍCH ==========
function getMapLink(lat, lng) {
    return `https://maps.google.com/?q=${lat},${lng}`;
}

// Lấy thông tin cơ bản (tối giản)
function getMinimalInfo() {
    const customer = getCustomerInfo();
    const { sessionId } = getOrCreateSession();
    return {
        customerId: customer.customerId.substring(0, 12) + "...",
        sessionId: sessionId,
        visitCount: customer.visitCount
    };
}

// Lấy thông tin chi tiết (chỉ dùng lần đầu)
function getDetailedUserInfo() {
    const ua = navigator.userAgent;
    
    let device = "💻 Desktop";
    let os = "Unknown";
    let browser = "Unknown";
    
    if (/iPhone|iPad|iPod/.test(ua)) {
        device = "📱 iOS";
        os = "iOS";
    } else if (/Android/.test(ua)) {
        device = "📱 Android";
        os = "Android";
    } else if (/Windows/.test(ua)) {
        device = "💻 Windows";
        os = "Windows";
    } else if (/Mac/.test(ua)) {
        device = "💻 Mac";
        os = "macOS";
    }
    
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) browser = "Chrome";
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
    else if (/Firefox/.test(ua)) browser = "Firefox";
    else if (/Edg/.test(ua)) browser = "Edge";
    
    let connection = "Unknown";
    if (navigator.connection) {
        connection = navigator.connection.effectiveType || navigator.connection.type || "Unknown";
    }
    
    return {
        device: device,
        os: os,
        browser: browser,
        connection: connection,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        referrer: document.referrer || "Trực tiếp",
        url: window.location.href
    };
}

// Lấy IP công cộng
async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return "Không lấy được IP";
    }
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

// ========== THÔNG BÁO LẦN ĐẦU (ĐẦY ĐỦ) ==========
async function notifyVisit() {
    if (hasSessionNotified()) {
        console.log("✅ Đã gửi thông báo trong phiên này, bỏ qua");
        return;
    }
    
    const info = getDetailedUserInfo();
    const ip = await getPublicIP();
    const customer = getCustomerInfo();
    const { sessionId } = getOrCreateSession();
    
    let customerStatus = customer.isNew ? "🆓 🎉 **KHÁCH MỚI** 🎉" : `🔄 **KHÁCH CŨ** (lần ${customer.visitCount})`;
    
    let message = `🌐 <b>🔴 NEW VISITOR</b>\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `${customerStatus}\n` +
                  `🆔 <b>Mã KH:</b> <code>${customer.customerId}</code>\n` +
                  `🔖 <b>Phiên:</b> <code>${sessionId}</code>\n` +
                  `📅 <b>Lần đầu:</b> ${new Date(customer.firstVisit).toLocaleString("vi-VN")}\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `📱 <b>Thiết bị:</b> ${info.device}\n` +
                  `💿 <b>OS:</b> ${info.os}\n` +
                  `🌍 <b>Trình duyệt:</b> ${info.browser}\n` +
                  `📶 <b>Kết nối:</b> ${info.connection}\n` +
                  `🗣 <b>Ngôn ngữ:</b> ${info.language}\n` +
                  `🖥 <b>Màn hình:</b> ${info.screen}\n` +
                  `🌐 <b>IP:</b> ${ip}\n` +
                  `🔗 <b>Đến từ:</b> ${info.referrer}\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `<a href="${info.url}">🔗 Click xem trang</a>`;
    
    await sendToTelegram(message);
    markSessionNotified();
}

// ========== THÔNG BÁO CLICK (TỐI GIẢN) ==========

async function notifyGrabClick() {
    const minimal = getMinimalInfo();
    
    let message = `🛵 <b>GRAB CLICK</b>\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `🔖 <b>Phiên:</b> <code>${minimal.sessionId}</code>\n` +
                  `🆔 <b>KH:</b> ${minimal.customerId}\n` +
                  `📊 <b>Lần:</b> ${minimal.visitCount}`;
    
    const location = await getLocationOnce();
    if (location) {
        const mapLink = getMapLink(location.lat, location.lng);
        message += `\n━━━━━━━━━━━━━━━━\n` +
                   `📍 <b>Vị trí:</b> <a href="${mapLink}">Xem map</a> (${Math.round(location.accuracy)}m)`;
    } else {
        if (locationDenied) {
            message += `\n━━━━━━━━━━━━━━━━\n📍 Khách từ chối vị trí`;
        } else {
            message += `\n━━━━━━━━━━━━━━━━\n📍 Không có vị trí`;
        }
    }
    
    await sendToTelegram(message);
}

async function notifyZaloClick() {
    const minimal = getMinimalInfo();
    
    let message = `💬 <b>ZALO CLICK</b>\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `🔖 <b>Phiên:</b> <code>${minimal.sessionId}</code>\n` +
                  `🆔 <b>KH:</b> ${minimal.customerId}\n` +
                  `📊 <b>Lần:</b> ${minimal.visitCount}`;
    
    const location = await getLocationOnce();
    if (location) {
        const mapLink = getMapLink(location.lat, location.lng);
        message += `\n━━━━━━━━━━━━━━━━\n` +
                   `📍 <b>Vị trí:</b> <a href="${mapLink}">Xem map</a> (${Math.round(location.accuracy)}m)`;
    } else {
        if (locationDenied) {
            message += `\n━━━━━━━━━━━━━━━━\n📍 Khách từ chối vị trí`;
        } else {
            message += `\n━━━━━━━━━━━━━━━━\n📍 Không có vị trí`;
        }
    }
    
    await sendToTelegram(message);
}

async function notifyCallClick() {
    const minimal = getMinimalInfo();
    
    let message = `📞 <b>CALL CLICK</b>\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `🔖 <b>Phiên:</b> <code>${minimal.sessionId}</code>\n` +
                  `🆔 <b>KH:</b> ${minimal.customerId}\n` +
                  `📊 <b>Lần:</b> ${minimal.visitCount}`;
    
    const location = await getLocationOnce();
    if (location) {
        const mapLink = getMapLink(location.lat, location.lng);
        message += `\n━━━━━━━━━━━━━━━━\n` +
                   `📍 <b>Vị trí:</b> <a href="${mapLink}">Xem map</a> (${Math.round(location.accuracy)}m)`;
    } else {
        if (locationDenied) {
            message += `\n━━━━━━━━━━━━━━━━\n📍 Khách từ chối vị trí`;
        } else {
            message += `\n━━━━━━━━━━━━━━━━\n📍 Không có vị trí`;
        }
    }
    
    await sendToTelegram(message);
}

// ========== PHÁT HIỆN THIẾT BỊ VÀ MỞ APP ==========

function isIOS() {
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isAndroid() {
    return /Android/.test(navigator.userAgent);
}
// Hàm mở App trên iOS (hoạt động trên cả Safari và Chrome)
function openAppOnIOS(appScheme, webLink, fallbackWebLink) {
    // Tạo một iframe ẩn để thử mở app
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = appScheme;
    document.body.appendChild(iframe);
    
    // Sau 500ms, nếu không chuyển sang app thì chuyển sang web
    const timeout = setTimeout(function() {
        window.location.href = webLink;
    }, 500);
    
    // Khi trang bị ẩn (chuyển sang app), xóa timeout
    const onPageHide = function() {
        clearTimeout(timeout);
        window.removeEventListener('pagehide', onPageHide);
    };
    window.addEventListener('pagehide', onPageHide);
    
    // Xóa iframe sau đó
    setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 100);
}
// Mở Grab App (Android fix)
function openGrab() {
    notifyGrabClick();
    
    const ios = isIOS();
    const android = isAndroid();
    
    if (ios) {
        // iOS: dùng iframe
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = "grab://";
        document.body.appendChild(iframe);
        
        const timeout = setTimeout(function() {
            window.location.href = GRAB_LINK;
        }, 800);
        
        window.addEventListener('pagehide', function() {
            clearTimeout(timeout);
        });
        
        setTimeout(() => {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 150);
    } 
    else if (android) {
        // Android: Dùng link grab:// trực tiếp (đơn giản hơn)
        // Cách 1: Thử mở bằng grab:// scheme trước
        window.location.href = "grab://";
        
        // Dự phòng: sau 1 giây chuyển sang web nếu không có app
        const timeout = setTimeout(function() {
            window.location.href = GRAB_LINK;
        }, 1000);
        
        // Nếu trang bị ẩn (chuyển sang app) thì xóa timeout
        window.addEventListener('pagehide', function() {
            clearTimeout(timeout);
        });
    }
    else {
        const link = document.createElement("a");
        link.href = GRAB_LINK;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Mở Zalo App (Android fix)
function openZalo() {
    notifyZaloClick();
    
    const ios = isIOS();
    const android = isAndroid();
    
    if (ios) {
        // iOS: dùng iframe
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = "zalo://";
        document.body.appendChild(iframe);
        
        const timeout = setTimeout(function() {
            window.location.href = ZALO_LINK;
        }, 800);
        
        window.addEventListener('pagehide', function() {
            clearTimeout(timeout);
        });
        
        setTimeout(() => {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 150);
    }
    else if (android) {
        // Android: Dùng zalo:// scheme trực tiếp
        window.location.href = "zalo://";
        
        const timeout = setTimeout(function() {
            window.location.href = ZALO_LINK;
        }, 1000);
        
        window.addEventListener('pagehide', function() {
            clearTimeout(timeout);
        });
    }
    else {
        window.location.href = ZALO_LINK;
    }
}

// Gọi điện
function callNow() {
    notifyCallClick();
    window.location.href = "tel:" + PHONE;
}

// Popup
function closePopup() {
    const popup = document.getElementById("popup");
    if (popup) popup.classList.remove("show");
}

function handleAction(type) {
    closePopup();
    if (type === 'grab') {
        openGrab();
    } else if (type === 'zalo') {
        openZalo();
    }
}

// ========== KHỞI TẠO ==========
resetLocationState();

let hasNotified = false;
window.addEventListener("load", function() {
    if (!hasNotified) {
        hasNotified = true;
        notifyVisit();
    }
});
