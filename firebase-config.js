// ========== FIREBASE CONFIG ==========
const firebaseConfig = {
    apiKey: "AIzaSyCMaSv4Rak3P4Ve_OKQhcNPzrcizxzUvEI",
    authDomain: "webmilano-aaf95.firebaseapp.com",
    projectId: "webmilano-aaf95",
    storageBucket: "webmilano-aaf95.firebasestorage.app",
    messagingSenderId: "639661806336",
    appId: "1:639661806336:web:e0e90756b9196dca07d9e5",
    measurementId: "G-92YWMVG08R"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Services
const db = firebase.database();

// Reference
const menuRef = db.ref('menu');
