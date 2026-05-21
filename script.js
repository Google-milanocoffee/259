const GRAB_LINK = "https://r.grab.com/o/MBVNJ3ii";
const ZALO_LINK = "https://zalo.me/0937513139";
const PHONE = "0937513139";

// ========== TELEGRAM CONFIG ==========
const TELEGRAM_BOT_TOKEN = "8246719122:AAH8CDUFWOP1xeMpZ4hi8uwQHlqzTfBSSh4";
const TELEGRAM_CHAT_ID = "6372876364";
// ======================================

// Hàm gửi thông báo đến Telegram
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

// Lấy thông tin chi tiết về thiết bị và trình duyệt
function getDetailedUserInfo() {
    const ua = navigator.userAgent;
    
    // Phát hiện thiết bị
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
    
    // Phát hiện trình duyệt
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) browser = "Chrome";
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
    else if (/Firefox/.test(ua)) browser = "Firefox";
    else if (/Edg/.test(ua)) browser = "Edge";
    
    // Lấy loại kết nối (nếu có)
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

// Lấy IP công cộng (gọi API bên ngoài)
async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return "Không lấy được IP";
    }
}

// Lấy vị trí địa lý (chỉ gọi khi click nút)
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

// Tạo link bản đồ
function getMapLink(lat, lng) {
    return `https://maps.google.com/?q=${lat},${lng}`;
}

// Thông báo truy cập trang (KHÔNG xin vị trí)
async function notifyVisit() {
    const info = getDetailedUserInfo();
    const ip = await getPublicIP();
    
    let message = `🌐 <b>🔴 NEW VISITOR</b>\n` +
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
    
    sendToTelegram(message);
}

// Thông báo click Grab (có xin vị trí)
async function notifyGrabClick() {
    const info = getDetailedUserInfo();
    const ip = await getPublicIP();
    
    let message = `🛵 <b>🟢 GRAB CLICK</b>\n` +
                 
                  `⏱ Đã click nút Grab`;
    
    const location = await getLocation();
    if (location) {
        const mapLink = getMapLink(location.lat, location.lng);
        message += `\n━━━━━━━━━━━━━━━━\n` +
                   `📍 <b>VỊ TRÍ KHÁCH</b>\n` +
                   `🗺 <a href="${mapLink}">Xem trên bản đồ</a>\n` +
                   `🎯 Độ chính xác: ${Math.round(location.accuracy)}m`;
    } else {
        message += `\n━━━━━━━━━━━━━━━━\n` +
                   `📍 Không chia sẻ vị trí (hoặc từ chối)`;
    }
    
    await sendToTelegram(message);
}

// Thông báo click Zalo (có xin vị trí)
async function notifyZaloClick() {
    const info = getDetailedUserInfo();
    const ip = await getPublicIP();
    
    let message = `💬 <b>🔵 ZALO CLICK</b>\n` +
                  
                  `⏱ Đã click nút Zalo`;
    
    const location = await getLocation();
    if (location) {
        const mapLink = getMapLink(location.lat, location.lng);
        message += `\n━━━━━━━━━━━━━━━━\n` +
                   `📍 <b>VỊ TRÍ KHÁCH</b>\n` +
                   `🗺 <a href="${mapLink}">Xem trên bản đồ</a>\n` +
                   `🎯 Độ chính xác: ${Math.round(location.accuracy)}m`;
    } else {
        message += `\n━━━━━━━━━━━━━━━━\n` +
                   `📍 Không chia sẻ vị trí (hoặc từ chối)`;
    }
    
    await sendToTelegram(message);
}

// Thông báo click gọi điện (có xin vị trí)
async function notifyCallClick() {
    const info = getDetailedUserInfo();
    const ip = await getPublicIP();
    
    let message = `📞 <b>🟠 CALL CLICK</b>\n` +
                 
                  `⏱ Đã click nút Gọi điện`;
    
    const location = await getLocation();
    if (location) {
        const mapLink = getMapLink(location.lat, location.lng);
        message += `\n━━━━━━━━━━━━━━━━\n` +
                   `📍 <b>VỊ TRÍ KHÁCH</b>\n` +
                   `🗺 <a href="${mapLink}">Xem trên bản đồ</a>\n` +
                   `🎯 Độ chính xác: ${Math.round(location.accuracy)}m`;
    } else {
        message += `\n━━━━━━━━━━━━━━━━\n` +
                   `📍 Không chia sẻ vị trí (hoặc từ chối)`;
    }
    
    await sendToTelegram(message);
}

function openGrab() {
    notifyGrabClick().then(() => {
        setTimeout(() => {
            // Phát hiện iOS
            const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
            
            if (isIOS) {
                // Cách 1: Dùng window.location (thường hoạt động tốt trên iOS)
                window.location.href = GRAB_LINK;
                
                // Cách 2 (dự phòng): Nếu không chuyển, sau 2.5s chuyển sang web
                setTimeout(function() {
                    window.location.href = "https://grab.com/vn/";
                }, 2500);
            } else {
                // Android / PC: dùng cách cũ
                const link = document.createElement("a");
                link.href = GRAB_LINK;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }, 300);
    }).catch(() => {
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (isIOS) {
            window.location.href = GRAB_LINK;
        } else {
            const link = document.createElement("a");
            link.href = GRAB_LINK;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
}

function openZalo() {
    notifyZaloClick().then(() => {
        setTimeout(() => {
            window.location.href = ZALO_LINK;
        }, 300);
    }).catch(() => {
        window.location.href = ZALO_LINK;
    });
}

function callNow() {
    notifyCallClick().then(() => {
        setTimeout(() => {
            window.location.href = "tel:" + PHONE;
        }, 300);
    }).catch(() => {
        window.location.href = "tel:" + PHONE;
    });
}

function closePopup() {
    document.getElementById("popup").classList.remove("show");
}

function handleAction(type) {
    closePopup();
    if (type === 'grab') {
        openGrab();
    } else if (type === 'zalo') {
        openZalo();
    }
}

// === TỰ ĐỘNG GỬI THÔNG BÁO KHI TRUY CẬP ===
let hasNotified = false;
window.addEventListener("load", function() {
    if (!hasNotified) {
        hasNotified = true;
        notifyVisit();
    }
});
