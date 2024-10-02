import { backend } from 'declarations/backend';

const inputText = document.getElementById('inputText');
const languageSelect = document.getElementById('languageSelect');
const translateBtn = document.getElementById('translateBtn');
const outputText = document.getElementById('outputText');
const speakBtn = document.getElementById('speakBtn');
const translationHistory = document.getElementById('translationHistory');

translateBtn.addEventListener('click', translateText);
speakBtn.addEventListener('click', speakTranslation);

async function translateText() {
    const text = inputText.value;
    const targetLang = languageSelect.value;
    
    if (!text) return;

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();
        
        if (data.responseStatus === 200) {
            const translatedText = data.responseData.translatedText;
            outputText.textContent = translatedText;
            
            // Add translation to backend
            await backend.addTranslation(text, translatedText, getLanguageName(targetLang));
            
            // Update translation history
            updateTranslationHistory();
        } else {
            outputText.textContent = 'Translation error. Please try again.';
        }
    } catch (error) {
        console.error('Translation error:', error);
        outputText.textContent = 'Translation error. Please try again.';
    }
}

function speakTranslation() {
    const text = outputText.textContent;
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageSelect.value;
    speechSynthesis.speak(utterance);
}

async function updateTranslationHistory() {
    const translations = await backend.getTranslations();
    translationHistory.innerHTML = '';
    translations.slice(-5).reverse().forEach(t => {
        const li = document.createElement('li');
        li.textContent = `${t.original} → ${t.translated} (${t.language})`;
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

// Initialize translation history on page load
updateTranslationHistory();
