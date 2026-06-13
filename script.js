// ========== TELEGRAM CONFIG ==========
const TELEGRAM_BOT_TOKEN = "8813111415:AAHjX0-vXMM0dVgVqDSSZNbHtiQ2wiVsFrc";
const TELEGRAM_CHAT_ID = "6372876364";

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
    
    let message = `🛵 <b>GRAB CLICK</b>\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `🆔 <b>KH:</b> ${customer.customerId.substring(0, 12)}...\n` +
                  `📊 <b>Lần truy cập:</b> ${customer.visitCount}`;
    
    await sendToTelegram(message);
}

// ========== THÔNG BÁO CLICK ZALO ==========
async function notifyZaloClick() {
    const customer = getCustomerInfo();
    
    let message = `💬 <b>ZALO CLICK</b>\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `🆔 <b>KH:</b> ${customer.customerId.substring(0, 12)}...\n` +
                  `📊 <b>Lần truy cập:</b> ${customer.visitCount}`;
    
    await sendToTelegram(message);
}

// ========== THÔNG BÁO GỌI ĐIỆN ==========
async function notifyCallClick() {
    const customer = getCustomerInfo();
    
    let message = `📞 <b>CALL CLICK</b>\n` +
                  `━━━━━━━━━━━━━━━━\n` +
                  `🆔 <b>KH:</b> ${customer.customerId.substring(0, 12)}...\n` +
                  `📊 <b>Lần truy cập:</b> ${customer.visitCount}`;
    
    await sendToTelegram(message);
}

// ========== PHÁT HIỆN THIẾT BỊ ==========
function isIOS() {
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

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
    
    setTimeout(() => {
        window.location.href = "https://grab.com/vn/";
    }, 3000);
}

// ========== MỞ ZALO ==========
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

// ========== GỌI ĐIỆN ==========
function callNow() {
    notifyCallClick();
    window.location.href = "tel:" + PHONE;
}

// ========== POPUP ==========
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
let hasNotified = false;
window.addEventListener("load", function() {
    if (!hasNotified) {
        hasNotified = true;
        notifyVisit();
    }
});
