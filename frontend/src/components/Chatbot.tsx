import { useState, useEffect, useRef } from 'react';
import { Mic, Send, X, Loader2, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useUser } from '../contexts/UserContext';
import { PROJECTS } from '../data/projects';
import { navigateTo } from '../utils/navigation';
import { BrandLogo } from './BrandLogo';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

function formatMarkdown(raw: string): string {
  if (!raw) return '';

  let html = raw;

  // 1. Convert Markdown Images: ![Alt](url) -> Interactive Clickable Card navigating to /project/:id
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => {
    const cleanSrc = src.trim();
    // Resolve project from image filename or alt title
    const idFromSrc = cleanSrc.replace('/projects/', '').replace('/project/', '').replace(/\.(jpg|png|webp|jpeg)/i, '').trim();
    const matchedProject = PROJECTS.find(p => p.id.toLowerCase() === idFromSrc.toLowerCase() || p.image.toLowerCase() === cleanSrc.toLowerCase()) ||
                           PROJECTS.find(p => alt && p.title.toLowerCase().includes(alt.toLowerCase())) ||
                           PROJECTS.find(p => alt && alt.toLowerCase().includes(p.title.toLowerCase().split(' ')[0])) ||
                           PROJECTS[0];

    const targetId = matchedProject ? matchedProject.id : (idFromSrc || 'tower-1');
    const projectTitle = matchedProject ? matchedProject.title : (alt || 'View Landmark Project');
    const projectPrice = matchedProject ? matchedProject.price : 'TS-RERA Approved';
    const projectCategory = matchedProject ? matchedProject.category : 'Luxury Property';

    return `<div 
      data-project-link="/project/${targetId}" 
      role="button" 
      tabindex="0"
      title="Click to view full landing page for ${projectTitle}"
      class="group relative my-3 overflow-hidden rounded-2xl border border-outline-variant/40 shadow-xs hover:shadow-md transition-all cursor-pointer bg-white active:scale-[0.98]"
    >
      <div class="relative overflow-hidden bg-surface-variant pointer-events-none">
        <img src="${cleanSrc}" alt="${projectTitle}" class="w-full h-36 sm:h-44 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onerror="this.src='/projects/tower-1.jpg'" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-2.5">
          <span class="bg-emerald-600/95 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
            ${projectCategory}
          </span>
          <span class="bg-white/95 text-primary text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 group-hover:bg-primary group-hover:text-white transition-all">
            <span>View Landing Page</span>
            <span style="font-size: 11px;">➔</span>
          </span>
        </div>
      </div>
      <div class="p-2.5 sm:p-3 bg-white flex items-center justify-between border-t border-outline-variant/20 pointer-events-none">
        <div class="min-w-0 pr-2">
          <span class="block text-xs sm:text-[13px] font-bold text-primary truncate group-hover:text-emerald-800 transition-colors">${projectTitle}</span>
          <span class="text-[10px] text-emerald-800 font-bold block mt-0.5">${projectPrice}</span>
        </div>
        <div class="w-7 h-7 rounded-full bg-surface-container-low group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center shrink-0 transition-colors">
          <span style="font-size: 13px;">➔</span>
        </div>
      </div>
    </div>`;
  });

  // 2. Headers: ### Title -> <h4 class="font-bold text-xs sm:text-sm text-primary mt-2 mb-1">Title</h4>
  html = html.replace(/^### (.*$)/gim, '<h4 class="font-extrabold text-xs sm:text-sm text-primary mt-2.5 mb-1 flex items-center gap-1">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="font-extrabold text-sm sm:text-base text-primary mt-3 mb-1.5">$1</h3>');

  // 3. Project-aware Bold Titles: Convert project titles into interactive 1-tap links
  html = html.replace(/\*\*([^*]+)\*\*/g, (_match, content) => {
    const trimmed = content.trim();
    const matchedProject = PROJECTS.find(p => 
      p.title.toLowerCase() === trimmed.toLowerCase() ||
      trimmed.toLowerCase().includes(p.title.toLowerCase()) ||
      (trimmed.length > 6 && p.title.toLowerCase().includes(trimmed.toLowerCase()))
    );

    if (matchedProject) {
      return `<a href="/project/${matchedProject.id}" data-project-link="/project/${matchedProject.id}" title="View ${matchedProject.title} landing page" class="inline-flex items-center gap-1 font-extrabold text-emerald-800 hover:text-emerald-950 underline decoration-emerald-600 decoration-1 underline-offset-2 cursor-pointer bg-emerald-50/80 px-1.5 py-0.5 rounded-md hover:bg-emerald-100 transition-colors">${content} <span class="text-[10px] font-sans no-underline text-emerald-700">↗</span></a>`;
    }

    return `<strong class="font-bold text-primary">${content}</strong>`;
  });

  // 4. Bullet lists: • text or * text or - text
  html = html.replace(/^[•\-\*]\s+(.*$)/gim, '<div class="flex items-start gap-1.5 my-0.5 text-xs sm:text-[13px] leading-relaxed"><span class="text-emerald-700 font-bold shrink-0">•</span><span>$1</span></div>');

  // 5. Links: [text](url) -> SPA project navigation or external links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
    const cleanUrl = url.trim();
    // If it points to a project route or internal relative path
    if (cleanUrl.includes('project') || cleanUrl.startsWith('/') || cleanUrl.startsWith('#')) {
      let route = cleanUrl.replace(/https?:\/\/[^\/]+/, '');
      route = route.replace('/projects/', '/project/');
      return `<a href="${route}" data-project-link="${route}" class="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline decoration-emerald-600 underline-offset-2 cursor-pointer transition-colors">${text} <span class="no-underline text-[10px]">↗</span></a>`;
    }
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-emerald-800 font-bold underline hover:text-emerald-950">${text}</a>`;
  });

  // 6. Code inline: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-primary/10 text-primary font-mono text-[10px] px-1.5 py-0.5 rounded font-bold border border-primary/20">$1</code>');

  // 7. Line breaks: replace double newlines with spacing, single with <br/>
  html = html.replace(/\n\n/g, '<div class="h-2"></div>');
  html = html.replace(/\n/g, '<br />');

  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'loading', 'rel', 'onerror', 'data-project-link', 'role', 'tabindex', 'title', 'style', 'href'],
    ADD_TAGS: ['img', 'span', 'div', 'strong', 'h3', 'h4', 'code', 'a', 'br']
  });
}

export function Chatbot() {
  const { isRegistered, registerUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '### Welcome to Hyderabad Homes 👋\n\nI am your **AI Real Estate Concierge** powered by Llama 3.2 Vision AI.\n\nAsk me about properties by **budget** (e.g. *under ₹1.5 Cr*, *₹2 Cr - ₹3 Cr*, *Luxury Villas*), or tap on any property photo to open its **full landing page**!',
      sender: 'bot'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', interest: 'Towers' });

  // Quick budget & discovery prompts
  const suggestedQuestions = [
    "Properties under ₹1.5 Cr",
    "Budget ₹2 Cr - ₹3.5 Cr",
    "Luxury Villas ₹4 Cr+",
    "Show me SAS Crown",
    "Book chauffeured site visit"
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show icon and open window after 7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIcon(true);
      setIsOpen(true);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Strict 3-message gate for unregistered visitors
    if (!isRegistered && messageCount >= 3) {
      setShowBookingForm(true);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: '### 🔒 Complimentary Preview Limit Reached (3/3)\n\nPlease provide your name and 10-digit phone number in the form below to unlock **unlimited AI consultation** and direct relationship manager access.',
        sender: 'bot'
      }]);
      return;
    }

    const nextCount = messageCount + 1;
    setMessageCount(nextCount);

    const newUserMsg: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        sender: 'bot'
      };

      setMessages(prev => [...prev, newBotMsg]);
      setIsLoading(false);

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        if (chunkValue) {
          setMessages(prev => prev.map(msg =>
            msg.id === newBotMsg.id ? { ...msg, text: msg.text + chunkValue } : msg
          ));
        }
      }

      // If user just consumed their 3rd free message, trigger registration gate
      if (!isRegistered && nextCount >= 3) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            text: '### 🔒 Free Preview Limit (3/3 Questions Used)\n\nYou have used your **3 complimentary questions**. To continue chatting with our Senior Advisors and download verified pricing dossiers, please register your contact details below.',
            sender: 'bot'
          }]);
          setShowBookingForm(true);
        }, 600);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, our advisory servers are momentarily busy. Please call our hotline at **+91 91234 56789** for immediate assistance.',
        sender: 'bot'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          interest: formData.interest,
          message: `[AI Chatbot Lead Registration] Interest: ${formData.interest}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        const registeredName = data.user?.name || formData.name;
        registerUser(registeredName, formData.phone);

        setShowBookingForm(false);
        setMessageCount(0);

        const welcomeText = `### ✅ Registration Confirmed!\n\nThank you, **${registeredName}**! You have unlocked **unlimited chat consultations**. Our Senior Advisor will also connect with you via +91 ${formData.phone} with customized floor plans and price sheets. How else can I assist your property search today?`;

        setMessages(prev => [...prev, { id: Date.now().toString(), text: welcomeText, sender: 'bot' }]);
      } else if (res.status === 409) {
        registerUser(formData.name, formData.phone);
        setShowBookingForm(false);
        setMessageCount(0);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `### Welcome back, **${formData.name}**!\n\nYour profile has been verified. You now have **unlimited chat access**. Ask any question!`,
          sender: 'bot'
        }]);
      } else {
        alert('Please provide a valid Name and 10-digit mobile number.');
      }
    } catch {
      alert('Network error. Please try again.');
    }
    setIsLoading(false);
  };

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSendMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div
        className={`bg-surface text-on-surface w-[340px] sm:w-[390px] max-w-[calc(100vw-1.5rem)] rounded-[22px] sm:rounded-[26px] shadow-2xl border border-outline/20 overflow-hidden transition-all duration-500 ease-in-out transform origin-bottom-right md:origin-right ${
          isOpen ? 'scale-100 opacity-100 mb-3 sm:mb-4' : 'scale-0 opacity-0 h-0 w-0 mb-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-[#0F1C16] text-white p-3.5 sm:p-4 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <BrandLogo size="xs" showText={false} clickable={false} />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs sm:text-sm tracking-tight text-white">Hyderabad Homes</h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-0.5">
                  <Sparkles size={9} />
                  <span>Llama 3.2 AI</span>
                </span>
              </div>
              <p className="text-[10px] text-white/70">Verified Real Estate Advisory Concierge</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
            title="Minimize Chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3-Question Free Preview Meter for Unregistered Users */}
        {!isRegistered && (
          <div className="bg-amber-50/90 border-b border-amber-200/80 px-3 py-1.5 flex items-center justify-between text-[11px] text-amber-950">
            <div className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px] text-amber-700">chat_bubble</span>
              <span>Free Preview: <strong>{Math.max(0, 3 - messageCount)} of 3</strong> questions left</span>
            </div>
            <button
              onClick={() => setShowBookingForm(true)}
              className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors"
            >
              Unlock All
            </button>
          </div>
        )}

        {/* Messages with 1-Tap Navigation to Project Landing Pages */}
        <div
          onClick={(e) => {
            const target = e.target as HTMLElement;

            // 1. Check for data-project-link attribute
            const card = target.closest('[data-project-link]');
            if (card) {
              e.preventDefault();
              e.stopPropagation();
              const link = card.getAttribute('data-project-link');
              if (link) {
                let cleanLink = link.trim().replace('/projects/', '/project/');
                cleanLink = cleanLink.replace(/https?:\/\/[^\/]+/, '');
                navigateTo(cleanLink);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
              }
            }

            // 2. Check for <a> anchor tags (including project links and internal routes)
            const anchor = target.closest('a');
            if (anchor) {
              const href = anchor.getAttribute('href');
              if (href) {
                // If it's a project route or internal relative link
                if (href.includes('/project') || href.startsWith('/') || href.startsWith('#')) {
                  e.preventDefault();
                  e.stopPropagation();
                  if (href.startsWith('#')) {
                    const el = document.querySelector(href);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    let cleanHref = href.trim().replace('/projects/', '/project/');
                    cleanHref = cleanHref.replace(/https?:\/\/[^\/]+/, '');
                    navigateTo(cleanHref);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                  return;
                }
              }
            }
          }}
          className="h-[280px] sm:h-[340px] md:h-[400px] overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 bg-[#FBFBFA]"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[88%] rounded-2xl p-3 sm:p-3.5 leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-xs self-end'
                  : 'bg-white text-[#1E2522] rounded-tl-xs self-start border border-outline-variant/30'
              }`}
            >
              <div
                className="text-xs sm:text-[13px] leading-relaxed break-words"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }}
              />
            </div>
          ))}

          {isLoading && (
            <div className="bg-white text-[#1E2522] rounded-2xl rounded-tl-xs p-3 self-start max-w-[85%] flex items-center gap-2 border border-outline-variant/30 shadow-xs">
              <Loader2 size={16} className="animate-spin text-emerald-700" />
              <span className="text-xs text-on-surface-variant font-medium">Llama 3.2 is preparing response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area OR Lead Gate Form */}
        {showBookingForm ? (
          <div className="p-3.5 sm:p-4 bg-white border-t border-outline-variant/30 animate-fadeIn space-y-2.5">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={15} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-primary leading-tight">
                  Unlock Unlimited AI Consultations
                </h4>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant mt-0.5 leading-normal">
                  Provide your details to continue chatting and receive official RERA price dossiers.
                </p>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="flex flex-col gap-2 pt-1">
              <input
                type="text"
                placeholder="Full Name *"
                required
                pattern="[A-Za-z\s]{3,50}"
                title="Name must contain at least 3 letters"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-base sm:text-xs text-on-surface focus:outline-none focus:border-primary min-h-[42px]"
              />

              <input
                type="tel"
                placeholder="Mobile Phone (10 digits) *"
                required
                pattern="(\+91)?[0-9]{10}"
                title="Must be a 10-digit mobile number"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-base sm:text-xs text-on-surface focus:outline-none focus:border-primary min-h-[42px]"
              />

              <select
                value={formData.interest}
                onChange={e => setFormData({ ...formData, interest: e.target.value })}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-base sm:text-xs text-on-surface focus:outline-none focus:border-primary min-h-[42px]"
              >
                <option value="Towers">High-Rise Sky Condos (Kokapet / RAIDURG)</option>
                <option value="Apartments">Luxury Gated Apartments (Financial District)</option>
                <option value="Villas">Spanish & Lakeside Villas (Gandipet / Mokila)</option>
                <option value="Individual Houses">Private Estates (Jubilee Hills / Puppalguda)</option>
                <option value="Ventures">HMDA / RERA Plotted Ventures (Moinabad)</option>
              </select>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-tertiary text-white rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 min-h-[42px] mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Unlock Unlimited Chat</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-2.5 sm:p-3 bg-white border-t border-outline-variant/30 flex flex-col gap-2">
            {/* Suggested Question Pills */}
            {messages.length < 5 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="whitespace-nowrap bg-surface-container-low hover:bg-surface-container text-primary text-[10px] sm:text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors border border-outline-variant/20 active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="flex items-center gap-1.5 bg-surface border border-outline-variant/30 rounded-xl px-2.5 py-1 focus-within:border-primary transition-all shadow-2xs">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                placeholder={!isRegistered && messageCount >= 3 ? "Register to continue chatting..." : "Ask about properties, pricing, visits..."}
                disabled={!isRegistered && messageCount >= 3}
                className="flex-1 bg-transparent border-none focus:outline-none text-on-surface text-base sm:text-xs py-2 w-full placeholder:text-on-surface-variant/60 disabled:cursor-not-allowed"
              />
              <button
                onClick={toggleListen}
                disabled={!isRegistered && messageCount >= 3}
                className={`p-1.5 rounded-lg transition-colors ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'text-primary hover:bg-surface-variant'
                }`}
                title="Voice Input"
              >
                <Mic size={16} />
              </button>
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || (!isRegistered && messageCount >= 3)}
                className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:hover:bg-primary"
                title="Send Message"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#003020] to-[#154734] text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-400/20 ${
          showIcon && !isOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'
        }`}
        title="Open Real Estate Chatbot"
      >
        <span className="material-symbols-outlined text-[24px]">forum</span>
      </button>
    </div>
  );
}
