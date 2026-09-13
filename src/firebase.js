import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Cấu hình Firebase từ dự án của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBEuwjy74zTnP5p6CjXEMmRwj6Aoi5ftBw",
  authDomain: "randomfood-8cd3f.firebaseapp.com",
  projectId: "randomfood-8cd3f",
  storageBucket: "randomfood-8cd3f.firebasestorage.app",
  messagingSenderId: "802374567195",
  appId: "1:802374567195:web:5f750e944ba6d911333fbe",
  measurementId: "G-F9XSE3FLYH"
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);

// Xuất cơ sở dữ liệu Firestore để sử dụng ở các component React
export const db = getFirestore(app);