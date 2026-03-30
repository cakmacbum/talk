import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Send, User, Bot, ArrowLeft, Settings, Loader2, MessageSquare, Trophy, ChevronRight, Home, Edit3, Zap, BarChart2, User as UserIcon, PlusCircle, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { scenarios, Scenario } from './data/scenarios';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [step, setStep] = useState<'login' | 'app'>('login');
  const [activeTab, setActiveTab] = useState<'home' | 'scenarios'>('home');
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accumulatedJsonRef = useRef<string>("");

  // Audio Refs
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, evaluation]);

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    setIsAiSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    setIsRecording(false);
    setIsAiSpeaking(false);
    window.speechSynthesis.cancel();
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current = null;
    }
  };

  const startVoiceChat = async (scenario: Scenario) => {
    setActiveScenario(scenario);
    setMessages([]);
    setEvaluation(null);
    accumulatedJsonRef.current = "";
    setIsLoading(true);

    const systemInstruction = `Sen "Talkpart" uygulamasının resmi Yapay Zeka Dil Eğitmenisin.
Görevin, belirtilen senaryoda bir role bürünmek, kullanıcıyla %100 İngilizce diyalog kurmak ve onu anlık olarak değerlendirmektir.

### MEVCUT DURUM ###
Adım: ${scenario.number}
Seviye: ${scenario.level}
Konu: ${scenario.title}
Senaryo: ${scenario.scenario}
Mevcut Tur (Current Turn): Diyalog boyunca kaçıncı turda olduğunu sen takip et. Toplam 5 tur.

### İŞLEYİŞ VE KURALLAR ###
1. Asla "Ben bir yapay zekayım" deme, role sadık kal.
2. Diyalog toplam 5 tur (karşılıklı mesajlaşma) sürecektir. Kaçıncı turda olduğunu sen takip etmelisin.
3. Tur 1, 2, 3 ve 4'te: Kullanıcının cevabına senaryoya uygun bir karşılık ver ve sohbeti derinleştirmek için mutlaka yeni bir SORU sor.
4. Tur 5'te (Son Tur): Kullanıcının cevabına son bir toparlayıcı ve tebrik edici İngilizce cümle kur. Yeni soru SORMA. Diyaloğu doğal bir şekilde bitir.
5. Kullanıcının İngilizce cümlesini Speaking, Vocabulary ve Grammar açısından 10 üzerinden puanla ve kelime sayısını (user_word_count) tam olarak say.
6. Çıktı SADECE aşağıdaki JSON formatında olmalıdır.

### JSON ÇIKTI FORMATI ###
{
  "ai_spoken_response": "Senaryodaki role uygun olarak vereceğin İngilizce cevap veya soru.",
  "user_evaluation": {
    "speaking_score_out_of_10": [PUAN],
    "vocabulary_score_out_of_10": [PUAN],
    "grammar_score_out_of_10": [PUAN],
    "feedback_turkish": "Kullanıcının cümlesindeki hataları/doğruları anlatan Türkçe geri bildirim."
  },
  "user_word_count": [KULLANICININ_MESAJINDAKI_KELIME_SAYISI],
  "response_suggestions_for_user": [
    "Kullanıcının sana verebileceği 1. olası İngilizce cevap",
    "Kullanıcının sana verebileceği 2. olası İngilizce cevap",
    "Kullanıcının sana verebileceği 3. olası İngilizce cevap"
  ],
  "step_completed": [EĞER_TURN_NUMBER_5_İSE_true_YAP_AKSİ_HALDE_false_YAP]
}`;

    try {
      sessionRef.current = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.TEXT],
          systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            setIsLoading(false);
            if (sessionRef.current) {
              sessionRef.current.then((session: any) => {
                session.sendRealtimeInput({ text: "Lütfen senaryoyu başlat ve ilk cümleyi sen kur." });
              }).catch(() => {});
            }
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
              streamRef.current = stream;
              audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
              const source = audioCtxRef.current.createMediaStreamSource(stream);
              const processor = audioCtxRef.current.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;
              
              source.connect(processor);
              processor.connect(audioCtxRef.current.destination);
              
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                  pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                }
                const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
                
                if (sessionRef.current) {
                  sessionRef.current.then((session: any) => {
                    session.sendRealtimeInput({ audio: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
                  }).catch(() => {});
                }
              };
              setIsRecording(true);
            } catch (err) {
              console.error("Microphone access denied:", err);
              setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Mikrofon erişimi reddedildi. Lütfen izin verin." }]);
            }
          },
          onmessage: (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.text) {
                  accumulatedJsonRef.current += part.text;
                }
              }
            }
            
            if (message.serverContent?.turnComplete) {
              try {
                let jsonStr = accumulatedJsonRef.current.trim();
                if (jsonStr.startsWith('```json')) {
                  jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
                } else if (jsonStr.startsWith('```')) {
                  jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
                }
                
                if (jsonStr) {
                  const parsed = JSON.parse(jsonStr);
                  
                  setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: parsed.ai_spoken_response }]);
                  
                  setEvaluation({
                    scores: parsed.user_evaluation,
                    wordCount: parsed.user_word_count,
                    suggestions: parsed.response_suggestions_for_user,
                    stepCompleted: parsed.step_completed
                  });
                  
                  speakText(parsed.ai_spoken_response);
                  
                  if (parsed.step_completed) {
                    setIsRecording(false);
                    if (processorRef.current) {
                      processorRef.current.disconnect();
                      processorRef.current = null;
                    }
                  }
                }
              } catch (e) {
                console.error("Failed to parse JSON:", e, accumulatedJsonRef.current);
                if (accumulatedJsonRef.current.trim()) {
                  setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: accumulatedJsonRef.current }]);
                  speakText(accumulatedJsonRef.current);
                }
              }
              
              accumulatedJsonRef.current = "";
            }
          },
          onclose: () => {
            stopAudio();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            stopAudio();
          }
        }
      });
    } catch (error) {
      console.error("Chat initialization failed:", error);
      setIsLoading(false);
    }
  };

  const closeChat = () => {
    stopAudio();
    setActiveScenario(null);
  };

  const groupedScenarios = scenarios.reduce((acc, curr) => {
    const level = curr.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(curr);
    return acc;
  }, {} as Record<string, Scenario[]>);

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-[#1a1525] flex flex-col items-center justify-center font-sans">
        <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(79,70,229,0.5)]">
          <Bot className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Talkpart</h1>
        <p className="text-gray-400 mb-10 text-center max-w-xs leading-relaxed">
          Yapay zeka ile sesli İngilizce pratiği yapın. Gemini hesabınızla otomatik olarak bağlanacaksınız.
        </p>
        <button 
          onClick={() => setStep('app')}
          className="bg-white text-gray-900 font-bold py-3.5 px-8 rounded-full flex items-center gap-3 hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google ile Giriş Yap
        </button>
        <p className="text-xs text-gray-500 mt-6 max-w-xs text-center">
          * AI Studio ortamında API anahtarı girmeden, doğrudan Gemini hesabınızla güvenli bir şekilde bağlanırsınız.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1525] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24 relative">
        <AnimatePresence mode="wait">
          
          {/* CHAT VIEW */}
          {activeScenario ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-50 bg-[#1a1525] flex flex-col"
            >
              <header className="bg-[#231d31] border-b border-[#322a46] px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
                <button 
                  onClick={closeChat}
                  className="p-2 hover:bg-[#322a46] rounded-full transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-300" />
                </button>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white leading-tight">{activeScenario.title}</h2>
                  <p className="text-xs text-gray-400">{activeScenario.level} • {activeScenario.scenario}</p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col">
                {messages.length === 0 && !isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4">
                      <Mic className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Konuşmaya Başlayın</h3>
                    <p className="text-gray-400 text-sm">Yapay zeka sizi dinliyor. İngilizce olarak cevap verin.</p>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-[#231d31] border border-[#322a46]'}`}>
                      {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-400" />}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-[#231d31] border border-[#322a46] text-gray-100 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                
                {evaluation && !isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#231d31] border border-[#322a46] rounded-2xl p-4 mt-4 shadow-lg"
                  >
                    <h4 className="text-sm font-bold text-indigo-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <BarChart2 className="w-4 h-4" /> Değerlendirme
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-[#1a1525] p-2 rounded-xl text-center border border-[#322a46]">
                        <div className="text-xs text-gray-400 mb-1">Speaking</div>
                        <div className="font-bold text-green-400">{evaluation.scores?.speaking_score_out_of_10}/10</div>
                      </div>
                      <div className="bg-[#1a1525] p-2 rounded-xl text-center border border-[#322a46]">
                        <div className="text-xs text-gray-400 mb-1">Vocabulary</div>
                        <div className="font-bold text-blue-400">{evaluation.scores?.vocabulary_score_out_of_10}/10</div>
                      </div>
                      <div className="bg-[#1a1525] p-2 rounded-xl text-center border border-[#322a46]">
                        <div className="text-xs text-gray-400 mb-1">Grammar</div>
                        <div className="font-bold text-yellow-400">{evaluation.scores?.grammar_score_out_of_10}/10</div>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-3 mb-4">
                      <p className="text-sm text-indigo-200 leading-relaxed">
                        <span className="font-bold text-indigo-400 mr-2">Geri Bildirim:</span>
                        {evaluation.scores?.feedback_turkish}
                      </p>
                    </div>

                    {evaluation.suggestions && evaluation.suggestions.length > 0 && !evaluation.stepCompleted && (
                      <div>
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <MessageSquare className="w-3 h-3" /> Ne diyebilirsin?
                        </h5>
                        <div className="space-y-2">
                          {evaluation.suggestions.map((sug: string, idx: number) => (
                            <div key={idx} className="bg-[#1a1525] border border-[#322a46] rounded-lg p-2 text-sm text-gray-300">
                              {sug}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {evaluation.stepCompleted && (
                      <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-center">
                        <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <h4 className="text-lg font-bold text-green-400 mb-1">Tebrikler!</h4>
                        <p className="text-sm text-green-200 mb-4">Bu senaryoyu başarıyla tamamladınız.</p>
                        <button 
                          onClick={closeChat}
                          className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-full transition-colors w-full"
                        >
                          Senaryolara Dön
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#231d31] border border-[#322a46] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="bg-[#231d31] border border-[#322a46] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span className="text-sm text-gray-400 font-medium">Bağlanıyor...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 bg-[#1a1525] border-t border-[#322a46] flex flex-col items-center justify-center">
                {!evaluation?.stepCompleted ? (
                  <>
                    <div className="relative">
                      {isAiSpeaking && (
                        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                      )}
                      {isRecording && !isAiSpeaking && (
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                      )}
                      <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 shadow-lg",
                        isAiSpeaking ? "bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.5)]" : 
                        isRecording ? "bg-green-600 shadow-[0_0_30px_rgba(34,197,94,0.5)]" : 
                        "bg-[#322a46]"
                      )}>
                        {isAiSpeaking ? (
                          <Volume2 className="w-10 h-10 text-white animate-pulse" />
                        ) : isRecording ? (
                          <Mic className="w-10 h-10 text-white" />
                        ) : (
                          <MicOff className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium mt-4 text-gray-400">
                      {isAiSpeaking ? "Yapay Zeka Konuşuyor..." : isRecording ? "Sizi Dinliyor..." : "Bağlantı Bekleniyor..."}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-green-400">
                    Senaryo tamamlandı.
                  </p>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'home' ? (
            /* HOME VIEW (Learning Path) */
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 pt-6"
            >
              {/* Stats Bar */}
              <div className="bg-[#231d31] rounded-2xl p-4 mb-8 border border-[#322a46] shadow-lg sticky top-4 z-10">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg">Yunus 171 kelime konuştu</h2>
                  <div className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 12 Gün Serisi
                  </div>
                </div>
                <div className="flex justify-between items-center px-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center">
                      <span className="font-bold text-sm">A1</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Vocabulary</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center">
                      <span className="font-bold text-sm">A2</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Grammar</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full border-4 border-yellow-500 flex items-center justify-center">
                      <span className="font-bold text-sm">B1</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Speaking</span>
                  </div>
                </div>
              </div>

              {/* Path */}
              <div className="relative max-w-md mx-auto py-8">
                <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-[#322a46] -translate-x-1/2 rounded-full opacity-50"></div>
                
                {Object.entries(groupedScenarios).map(([level, levelScenarios], levelIndex) => (
                  <div key={level} className="mb-12 relative">
                    
                    {/* Level Separator */}
                    <div className="flex justify-center mb-10 sticky top-32 z-10">
                      <div className="bg-[#1a1525] px-6 py-2 rounded-full border-2 border-pink-500 text-pink-500 font-bold text-sm shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                        SEVİYE {level}
                      </div>
                    </div>

                    {levelScenarios.map((scenario, index) => {
                      const isLeft = index % 2 === 0;
                      const isCompleted = scenario.number < 3;
                      const isCurrent = scenario.number === 3;
                      
                      return (
                        <div key={scenario.number} className={cn(
                          "flex items-center mb-12 relative z-10",
                          isLeft ? "justify-start pr-1/2" : "justify-end pl-1/2"
                        )}>
                          <div className={cn(
                            "flex items-center gap-4 w-[160px]",
                            isLeft ? "flex-row-reverse" : "flex-row"
                          )}>
                            <button
                              onClick={() => startVoiceChat(scenario)}
                              className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-transform hover:scale-110 shadow-lg relative",
                                isCompleted ? "bg-indigo-600 text-white" : 
                                isCurrent ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] ring-4 ring-green-500/30" : 
                                "bg-[#322a46] text-gray-400 border-2 border-[#4a3f63]"
                              )}
                            >
                              {scenario.number}
                              {isCurrent && (
                                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 w-6 h-6 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                </div>
                              )}
                            </button>
                            <div className={cn(
                              "flex flex-col",
                              isLeft ? "items-end text-right" : "items-start text-left"
                            )}>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Adım {scenario.number}</span>
                              <span className="text-sm font-medium text-white leading-tight">{scenario.title}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* SCENARIOS VIEW */
            <motion.div
              key="scenarios"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 h-full flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 bg-[#231d31] rounded-full flex items-center justify-center mb-6 border border-[#322a46]">
                <Edit3 className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Henüz hiç senaryo oluşturmadınız</h2>
              <p className="text-gray-400 mb-8 max-w-xs">
                Kendi özel senaryolarınızı oluşturarak istediğiniz konuda pratik yapabilirsiniz.
              </p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold py-4 px-8 rounded-full flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <PlusCircle className="w-5 h-5" />
                Yeni Senaryo Oluştur
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-[#231d31] border-t border-[#322a46] px-6 py-4 flex justify-between items-center fixed bottom-0 w-full z-40 pb-safe">
        <button 
          onClick={() => setActiveTab('home')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'home' ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
          )}
        >
          <Home className="w-6 h-6" />
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
          <Trophy className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveTab('scenarios')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'scenarios' ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
          )}
        >
          <Edit3 className="w-6 h-6" />
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
          <BarChart2 className="w-6 h-6" />
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
          <UserIcon className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}
