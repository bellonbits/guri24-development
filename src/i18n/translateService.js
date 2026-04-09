const CACHE_KEY = 'guri24_translations_so_v1';

// Free Google Translate endpoint (no API key required)
async function translateText(text, targetLang = 'so') {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
}

// Recursively translate all string values in a nested object
async function translateObject(obj, targetLang = 'so') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = await translateText(value, targetLang);
        } else if (typeof value === 'object' && value !== null) {
            result[key] = await translateObject(value, targetLang);
        } else {
            result[key] = value;
        }
    }
    return result;
}

// Fetch Somali translations — uses cache if available
export async function getSomaliTranslations(enTranslations) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch {
            // cache corrupted, re-fetch
        }
    }

    const translated = await translateObject(enTranslations, 'so');
    localStorage.setItem(CACHE_KEY, JSON.stringify(translated));
    return translated;
}

// Clear cached translations (call when you want a fresh fetch)
export function clearTranslationCache() {
    localStorage.removeItem(CACHE_KEY);
}
