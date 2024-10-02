import { AuthClient } from "@dfinity/auth-client";
import { backend } from 'declarations/backend';

const inputText = document.getElementById('inputText');
const languageSelect = document.getElementById('languageSelect');
const translateBtn = document.getElementById('translateBtn');
const outputText = document.getElementById('outputText');
const speakBtn = document.getElementById('speakBtn');
const translationHistory = document.getElementById('translationHistory');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userPrincipal = document.getElementById('userPrincipal');
const mainContent = document.getElementById('mainContent');

let authClient;

async function initAuth() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        handleAuthenticated();
    }
}

loginBtn.onclick = async () => {
    await authClient.login({
        identityProvider: "https://identity.ic0.app/#authorize",
        onSuccess: handleAuthenticated,
    });
};

logoutBtn.onclick = async () => {
    await authClient.logout();
    handleUnauthenticated();
};

function handleAuthenticated() {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    mainContent.style.display = 'block';
    const identity = authClient.getIdentity();
    userPrincipal.textContent = identity.getPrincipal().toText();
    updateTranslationHistory();
}

function handleUnauthenticated() {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    mainContent.style.display = 'none';
    userPrincipal.textContent = '';
}

translateBtn.addEventListener('click', translateText);
speakBtn.addEventListener('click', speakTranslation);

async function translateText() {
    const text = inputText.value.trim();
    const targetLang = languageSelect.value;
    
    if (!text) {
        showMessage('Please enter some text to translate.', 'error');
        return;
    }

    showMessage('Translating...', 'info');

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();
        
        if (data.responseStatus === 200) {
            const translatedText = data.responseData.translatedText;
            outputText.textContent = translatedText;
            showMessage('Translation complete!', 'success');
            
            await backend.addTranslation(text, translatedText, getLanguageName(targetLang));
            updateTranslationHistory();
        } else {
            showMessage('Translation error. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Translation error:', error);
        showMessage('Translation error. Please try again.', 'error');
    }
}

function speakTranslation() {
    const text = outputText.textContent;
    if (!text) {
        showMessage('No translation to speak.', 'error');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageSelect.value;
    speechSynthesis.speak(utterance);
    showMessage('Speaking translation...', 'info');
}

async function updateTranslationHistory() {
    const translations = await backend.getTranslations();
    translationHistory.innerHTML = '';
    translations.slice(-5).reverse().forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${t.original}</strong> → ${t.translated} <em>(${t.language})</em>`;
        translationHistory.appendChild(li);
    });
}

function getLanguageName(code) {
    switch (code) {
        case 'de': return 'German';
        case 'fr': return 'French';
        case 'es': return 'Spanish';
        default: return 'Unknown';
    }
}

function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    document.body.appendChild(messageElement);
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

initAuth();
