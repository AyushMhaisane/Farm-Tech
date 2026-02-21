import React, { useState, useEffect, useRef } from 'react';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState(null); // 'en-IN', 'hi-IN', or 'mr-IN'
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // --- NEW: Image Upload State ---
    const [selectedImage, setSelectedImage] = useState(null);

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingIndex, setSpeakingIndex] = useState(null);

    const chatEndRef = useRef(null);
    const silenceTimerRef = useRef(null);

    const getButtonLabels = (lang) => {
        const labels = {
            'en-IN': { read: 'Read Aloud', stop: 'Stop Reading', send: 'SEND', listen: 'Listening...', ask: 'Ask a question...', gathering: 'Gathering information...' },
            'hi-IN': { read: 'पढ़कर सुनाएं', stop: 'पढ़ना बंद करें', send: 'भेजें', listen: 'सुन रहा हूँ...', ask: 'सवाल पूछें...', gathering: 'जानकारी खोजी जा रही है...' },
            'mr-IN': { read: 'वाचून दाखवा', stop: 'वाचणे थांबवा', send: 'पाठवा', listen: 'ऐकत आहे...', ask: 'प्रश्न विचारा...', gathering: 'माहिती गोळा करत आहे...' }
        };
        return labels[lang] || labels['en-IN'];
    };

    const currentLabels = getButtonLabels(language);

    useEffect(() => {
        if (language) {
            const welcomeTexts = {
                'en-IN': 'Namaste! I am your Agro-Assistant. You can ask me questions or upload a photo of your crop!',
                'hi-IN': 'नमस्ते! मैं आपका एग्रो-असिस्टेंट हूं। आप मुझसे सवाल पूछ सकते हैं या अपनी फसल की फोटो भेज सकते हैं!',
                'mr-IN': 'नमस्कार! मी तुमचा एग्रो-असिस्टेंट आहे. तुम्ही मला प्रश्न विचारू शकता किंवा तुमच्या पिकाचा फोटो पाठवू शकता!'
            };
            setMessages([{ role: 'bot', text: welcomeTexts[language] }]);
        }
    }, [language]);

    const formatText = (text) => {
        if (!text) return '';
        return text
            .replace(/\*\*/g, '')
            .replace(/#/g, '')
            .replace(/^\s*[\*\-]\s/gm, '• ');
    };

    const cleanForSpeech = (text) => {
        if (!text) return '';
        return text
            .replace(/[\*\#\-\•]/g, ' ')
            .replace(/\([a-zA-Z\s]+\)/g, '')
            .trim();
    };

    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Please use Chrome.");

        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
            setInput(transcript);

            silenceTimerRef.current = setTimeout(() => {
                recognition.stop();
                sendMessage(transcript, true);
            }, 3000);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const speakResponse = (text, index) => {
        window.speechSynthesis.cancel();
        const textToSpeak = cleanForSpeech(text);
        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        utterance.lang = language === 'mr-IN' ? 'hi-IN' : language;
        utterance.rate = language === 'en-IN' ? 0.95 : 0.85;

        utterance.onstart = () => { setIsSpeaking(true); setSpeakingIndex(index); };
        utterance.onend = () => { setIsSpeaking(false); setSpeakingIndex(null); };
        utterance.onerror = () => { setIsSpeaking(false); setSpeakingIndex(null); };

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeakingIndex(null);
    };

    // --- NEW: Image File Handler ---
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result); // Saves the Base64 image
            };
            reader.readAsDataURL(file);
        }
    };

    // --- UPDATED: Send Message (Now handles images) ---
    const sendMessage = async (textToSend, isVoiceInput = false) => {
        // Allow sending if there is text OR an image
        const message = textToSend || input || (selectedImage ? "Please analyze this image." : "");
        if (!message.trim() && !selectedImage) return;

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        // Add the image to the local chat history so the user can see what they sent
        const currentMessages = [...messages, { role: 'user', text: message, image: selectedImage }];
        setMessages(currentMessages);

        setInput('');
        const imageToSend = selectedImage; // Store it locally for the fetch
        setSelectedImage(null); // Clear the preview UI instantly
        setLoading(true);
        stopSpeaking();

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // We now send both the message AND the base64 image
                body: JSON.stringify({ message, image: imageToSend }),
            });
            const data = await response.json();

            const newMessages = [...currentMessages, { role: 'bot', text: data.answer }];
            setMessages(newMessages);

            if (isVoiceInput) {
                const newBotMessageIndex = newMessages.length - 1;
                speakResponse(data.answer, newBotMessageIndex);
            }

        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to server." }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">

            {!isOpen && (
                <div className="mb-4 mr-2 bg-white text-green-800 px-5 py-2 rounded-2xl shadow-2xl border border-green-100 text-sm font-bold animate-pulse">
                    🌾 Select Language to Start!
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-green-100 rotate-45"></div>
                </div>
            )}

            {isOpen && (
                <div className="mb-4 mr-2 w-[400px] md:w-[480px] h-[700px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300">

                    <div className="bg-green-700 text-white p-6 flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full text-xl">🌾</div>
                            <div>
                                <h2 className="font-bold text-lg leading-tight">Agro-Bot Expert</h2>
                                <p className="text-[10px] uppercase font-bold opacity-80">
                                    {isSpeaking ? 'Speaking...' : language ? 'Active' : 'Setup'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => { stopSpeaking(); setIsOpen(false); setLanguage(null); }} className="hover:bg-green-800 p-2 rounded-full transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {!language ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 space-y-6">
                            <h3 className="text-xl font-bold text-gray-800 text-center">Choose your language / अपनी भाषा चुनें / तुमची भाषा निवडा</h3>
                            <div className="grid grid-cols-1 w-full gap-4">
                                {[
                                    { label: 'English', code: 'en-IN' },
                                    { label: 'हिंदी (Hindi)', code: 'hi-IN' },
                                    { label: 'मराठी (Marathi)', code: 'mr-IN' }
                                ].map((lang) => (
                                    <button key={lang.code} onClick={() => setLanguage(lang.code)} className="w-full py-4 bg-white border-2 border-green-100 rounded-2xl text-green-800 font-bold text-lg hover:bg-green-700 hover:text-white hover:border-green-700 transition-all shadow-sm active:scale-95">
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400">Voices will adjust automatically based on choice.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-3xl text-[16px] shadow-sm ${msg.role === 'user' ? 'bg-green-700 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>

                                            {/* NEW: Render the image in the chat if it exists */}
                                            {msg.image && (
                                                <img src={msg.image} alt="Uploaded Crop" className="w-full h-auto rounded-xl mb-3 border border-white/20" />
                                            )}

                                            <p className="whitespace-pre-wrap">{formatText(msg.text)}</p>

                                            {msg.role === 'bot' && (
                                                <div className="mt-3 pt-3 border-t border-gray-100/60 flex justify-end">
                                                    <button onClick={() => speakingIndex === i ? stopSpeaking() : speakResponse(msg.text, i)} className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${speakingIndex === i ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                                        {speakingIndex === i ? (
                                                            <><div className="w-2 h-2 bg-red-600 rounded-sm animate-pulse"></div> {currentLabels.stop}</>
                                                        ) : (
                                                            <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg> {currentLabels.read}</>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3 border border-gray-100">
                                            <div className="flex gap-1">
                                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce"></div>
                                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-500">{currentLabels.gathering}</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* --- NEW: Image Preview & Input Bar Layout --- */}
                            <div className="p-4 border-t bg-white flex flex-col gap-3 z-10 rounded-b-[2.5rem]">

                                {/* Image Preview Box (Only shows if an image is selected) */}
                                {selectedImage && (
                                    <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border-2 border-green-500 shadow-sm ml-2">
                                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button onClick={() => setSelectedImage(null)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )}

                                <div className="flex gap-3 items-center w-full px-2">
                                    <button onClick={handleVoiceInput} className={`p-4 rounded-full shadow-md transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v10a3 3 0 006 0V3a3 3 0 00-3-3z" /></svg>
                                    </button>

                                    {/* Hidden File Input & Camera Button */}
                                    <input type="file" accept="image/*" id="image-upload" className="hidden" onChange={handleImageUpload} />
                                    <label htmlFor="image-upload" className="p-4 rounded-full shadow-md bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </label>

                                    <input
                                        className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-600 min-w-0"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(input, false)}
                                        placeholder={isListening ? currentLabels.listen : currentLabels.ask}
                                    />
                                    <button onClick={() => sendMessage(input, false)} className="bg-green-700 text-white p-4 px-6 rounded-2xl shadow-xl hover:bg-green-800 active:scale-95 transition-all font-bold">
                                        {currentLabels.send}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            <button onClick={() => { setIsOpen(!isOpen); if (isOpen) { stopSpeaking(); setLanguage(null); } }} className="w-16 h-16 bg-green-700 rounded-full shadow-2xl flex items-center justify-center text-white ring-4 ring-white active:scale-95 transition-all">
                {isOpen ? <span className="text-xl font-bold">▼</span> : <span className="text-4xl">🌾</span>}
            </button>
        </div>
    );
};

export default ChatBot;