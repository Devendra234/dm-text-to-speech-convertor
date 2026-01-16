const text = document.getElementById("textToConvert");
const convertBtn = document.getElementById("convertBtn");
const error = document.querySelector(".error-para");
const voiceSelect = document.getElementById("voiceSelect");
const languageSelect = document.getElementById("languageSelect");

const speechSynth = window.speechSynthesis;
let voices = [];

/* ================== LOAD VOICES ================== */
function loadVoices() {
    voices = speechSynth.getVoices();
    populateVoices();
}

// Chrome loads voices async
speechSynth.onvoiceschanged = loadVoices;

/* ================== POPULATE VOICES ================== */
function populateVoices() {
    voiceSelect.innerHTML = "";

    let selectedLang = languageSelect.value;

    let filteredVoices = voices.filter(voice =>
        voice.lang.startsWith(selectedLang)
    );

    // 🇮🇳 Marathi fallback → Hindi
    if (filteredVoices.length === 0 && selectedLang === "mr") {
        filteredVoices = voices.filter(voice =>
            voice.lang.startsWith("hi")
        );

        const option = document.createElement("option");
        option.textContent = "Hindi Voice (Marathi not supported)";
        voiceSelect.appendChild(option);

        voiceSelect.disabled = false;
        return;
    }

    // ❌ No voice at all
    if (filteredVoices.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No voice available";
        voiceSelect.appendChild(option);
        voiceSelect.disabled = true;
        return;
    }

    filteredVoices.forEach((voice, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${voice.name}`;
        voiceSelect.appendChild(option);
    });

    voiceSelect.disabled = false;
}


/* ================== LANGUAGE CHANGE ================== */
languageSelect.addEventListener("change", populateVoices);

/* ================== PLAY SPEECH ================== */
convertBtn.addEventListener("click", () => {
    const enteredText = text.value.trim();

    // 🚫 Empty text
    if (!enteredText) {
        error.textContent = "Nothing to convert! Enter text in the text area.";
        return;
    }

    // 🚫 Prevent overlapping speech
    if (speechSynth.speaking) return;

    error.textContent = "";

    const utterance = new SpeechSynthesisUtterance(enteredText);

    const selectedLang = languageSelect.value;
    utterance.lang = selectedLang;

    const selectedVoiceIndex = voiceSelect.value;
    const filteredVoices = voices.filter(v =>
        v.lang.startsWith(selectedLang)
    );

    if (filteredVoices[selectedVoiceIndex]) {
        utterance.voice = filteredVoices[selectedVoiceIndex];
    }

    // 🎚 Optional tuning (premium feel)
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // 🔊 Speech started
    utterance.onstart = () => {
        convertBtn.textContent = "Sound is Playing...";
        convertBtn.disabled = true;
    };

    // ✅ Speech ended
    utterance.onend = () => {
        convertBtn.textContent = "Play Converted Sound";
        convertBtn.disabled = false;
    };

    // ⚠️ Error handling
    utterance.onerror = () => {
        error.textContent = "Speech synthesis failed. Try again.";
        convertBtn.textContent = "Play Converted Sound";
        convertBtn.disabled = false;
    };

    speechSynth.speak(utterance);
});
