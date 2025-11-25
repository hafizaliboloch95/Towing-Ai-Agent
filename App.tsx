import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini } from './services/geminiService';
import { Message, DispatchMode, Coordinates, GroundingMetadata } from './types';
import { ChatMessage } from './components/ChatMessage';

// --- SVGs ---
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tow-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'model',
      text: "Thank you for calling TowPro. I'm here to help. What's your emergency?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<DispatchMode>(DispatchMode.STANDARD);
  const [location, setLocation] = useState<Coordinates | undefined>();
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Request location on mount for better context
    setLocationStatus('requesting');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationStatus('granted');
        },
        (error) => {
          console.warn("Location access denied or failed", error);
          setLocationStatus('denied');
        }
      );
    } else {
      setLocationStatus('denied');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleModeToggle = () => {
    const newMode = mode === DispatchMode.STANDARD ? DispatchMode.COMPLEX : DispatchMode.STANDARD;
    setMode(newMode);
    
    // Add a system message indicating mode switch
    setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: newMode === DispatchMode.COMPLEX 
            ? "Switching to **Complex Analysis** (Gemini 3 Pro + Thinking). I will use advanced reasoning to handle complex recovery scenarios and logistics."
            : "Switching to **Standard Dispatch** (Gemini 2.5 Flash). I am now connected to **Google Maps** and **Search** for real-time location data.",
        timestamp: new Date()
    }]);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    // Optimistic update
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Small delay to ensure UI updates before freezing in processing
      await new Promise(resolve => setTimeout(resolve, 50));

      const response = await sendMessageToGemini(messages, userMsg.text, location, mode);
      const text = response.text || "I'm having trouble connecting to dispatch. Please call 911 if this is an emergency.";
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: new Date(),
        isThinking: mode === DispatchMode.COMPLEX,
        groundingMetadata
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "System Error: Connection lost. Please call our emergency line directly at 1-800-TOW-HELP or 911 for immediate safety concerns.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      // Reset height
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row max-w-7xl mx-auto bg-slate-950 shadow-2xl overflow-hidden">
      
      {/* Sidebar / Header */}
      <aside className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-tow-600 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">TowPro<span className="text-tow-500">.AI</span></h1>
          </div>
          <p className="text-xs text-slate-400 font-medium ml-1">24/7 EMERGENCY DISPATCH</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Status Card */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50">
             <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3 tracking-wider">System Status</h3>
             <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Agent</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Online
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Location Services</span>
                    <span className={`flex items-center gap-1 font-medium ${locationStatus === 'granted' ? 'text-blue-400' : 'text-slate-500'}`}>
                        <MapPinIcon />
                        {locationStatus === 'granted' ? 'Active' : locationStatus === 'requesting' ? 'Locating...' : 'Disabled'}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Wait Time</span>
                    <span className="text-tow-400 font-medium">~35 mins</span>
                </div>
             </div>
          </div>

          {/* Mode Toggle */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
             <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3 tracking-wider">Dispatch Mode</h3>
             <button 
                onClick={handleModeToggle}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                    mode === DispatchMode.COMPLEX 
                    ? 'bg-purple-900/20 border-purple-500/50 text-purple-200' 
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
             >
                <div className="flex items-center gap-3">
                    <BrainIcon />
                    <div className="text-left">
                        <div className="text-sm font-medium">{mode === DispatchMode.COMPLEX ? 'Complex Analysis' : 'Standard Dispatch'}</div>
                        <div className="text-[10px] opacity-70">
                            {mode === DispatchMode.COMPLEX ? 'Gemini 3 Pro + Thinking' : 'Gemini 2.5 Flash + Maps'}
                        </div>
                    </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${mode === DispatchMode.COMPLEX ? 'bg-purple-500' : 'bg-slate-600'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${mode === DispatchMode.COMPLEX ? 'left-4.5 translate-x-1' : 'left-0.5'}`}></div>
                </div>
             </button>
             
             <div className="mt-3 text-[10px] text-slate-500 leading-relaxed">
                {mode === DispatchMode.COMPLEX 
                    ? "Thinking Model (Gemini 3 Pro) enabled. Best for complex extraction planning, logistics, and difficult reasoning."
                    : "Standard Model (Gemini 2.5 Flash) enabled. Uses Google Maps & Search for location verification."}
             </div>
          </div>

        </div>

        {/* Emergency Footer */}
        <div className="p-4 bg-red-950/30 border-t border-red-900/30">
            <a href="tel:911" className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
                <PhoneIcon />
                CALL 911
            </a>
            <p className="text-center text-[10px] text-red-200/60 mt-2">
                If you are in immediate danger or injured, call 911 immediately.
            </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-80px)] md:h-screen relative">
        
        {/* Chat Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
            style={{
                backgroundImage: `radial-gradient(#475569 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
            }}>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 z-10 scrollbar-hide">
            
            {/* Safety Banner */}
            <div className="max-w-3xl mx-auto bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 mb-8 flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                    <AlertIcon />
                </div>
                <div>
                    <h4 className="text-amber-500 font-semibold text-sm">Safety First</h4>
                    <p className="text-amber-200/70 text-xs mt-1">
                        Do not exit your vehicle if you are on an active highway. Turn on your hazard lights. 
                        Wait for the dispatch agent to confirm your location.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto w-full pb-4">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                
                {isLoading && (
                    <div className="flex justify-start w-full mb-6">
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-tow-600 flex items-center justify-center">
                                <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                             </div>
                             <span className="text-xs text-slate-400 animate-pulse">
                                {mode === DispatchMode.COMPLEX ? 'Analyzing situation (Thinking)...' : 'Contacting driver...'}
                             </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 z-20 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto flex items-end gap-2 bg-slate-800 p-2 rounded-2xl border border-slate-700 focus-within:border-tow-500/50 focus-within:ring-1 focus-within:ring-tow-500/50 transition-all shadow-lg">
                <textarea 
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your location and emergency..."
                    className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm p-3 resize-none focus:outline-none max-h-[120px] scrollbar-hide"
                    rows={1}
                    disabled={isLoading}
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !inputText.trim()}
                    className="p-3 bg-tow-600 hover:bg-tow-500 disabled:opacity-50 disabled:hover:bg-tow-600 text-white rounded-xl transition-colors shrink-0"
                >
                    <SendIcon />
                </button>
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-2">
                Powered by Gemini 2.5 Flash (Standard) & Gemini 3 Pro (Complex).
            </p>
        </div>
      </main>

    </div>
  );
}
