// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA0Y_GG6IABfDxZr_ZRCoswJp8_hW4-6cI",
    authDomain: "kdjmatta.firebaseapp.com",
    projectId: "kdjmatta",
    storageBucket: "kdjmatta.firebasestorage.app",
    messagingSenderId: "409779377887",
    appId: "1:409779377887:web:733372df409aa6a7903b6a",
    measurementId: "G-0Y76P8V9MZ"
};

// Groq API configuration
const GROQ_API_KEY = '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'; // Replace with your actual Groq API key
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();