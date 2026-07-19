import { useState, useEffect, useRef } from 'react';
import { Mic, Send, X, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useUser } from '../contexts/UserContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export function Chatbot() {
  const { isRegistered, userName, registerUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! Welcome to Hyderabad Homes. How can I help you find your dream property today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', interest: 'Apartments' });

  const suggestedQuestions = [
    "What is the price of Skyline Heights?",
    "What are the ongoing projects?",
    "How to book a site visit?"
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

    if (!isRegistered && messageCount >= 3) {
      setShowBookingForm(true);
      return;
    }

    setMessageCount(prev => prev + 1);

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
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, our servers are currently busy. Please try again later.',
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
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        
        const registeredName = data.user?.name || formData.name;
        registerUser(registeredName, formData.phone);
        
        setShowBookingForm(false);
        setMessageCount(0);
        
        const welcomeText = data.existing 
          ? `Welcome back, ${registeredName}! Thank you for confirming. Your details have been updated. How else can I help you?`
          : `Thank you for your details, ${registeredName}! A representative will contact you soon. You can now continue chatting.`;
          
        setMessages(prev => [...prev, { id: Date.now().toString(), text: welcomeText, sender: 'bot' }]);
      } else if (res.status === 409) {
        alert('You are already registered.');
        registerUser(formData.name, formData.phone);
        setShowBookingForm(false);
        setMessageCount(0);
      } else {
        alert('Validation failed. Please provide a valid Name and Phone.');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
    setIsLoading(false);
  };

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
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
    <div className="fixed bottom-24 right-4 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div
        className={`bg-surface text-on-surface w-[280px] md:w-[350px] max-w-[calc(100vw-2rem)] rounded-[24px] shadow-2xl border border-outline/20 overflow-hidden transition-all duration-500 ease-in-out transform origin-bottom-right md:origin-right ${isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 h-0 w-0 mb-0 pointer-events-none'
          }`}
      >
        {/* Header */}
        <div className="bg-primary text-on-primary p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-bold text-lg">
              H
            </div>
            <div>
              <h3 className="font-bold font-headline-sm text-sm md:text-base">Hyderabad Homes</h3>
              <p className="text-[10px] md:text-xs opacity-80">Virtual Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-[250px] md:h-[350px] overflow-y-auto p-3 md:p-4 flex flex-col gap-3 md:gap-4 bg-surface-container-lowest">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-2xl p-3 ${msg.sender === 'user'
                ? 'bg-primary text-on-primary rounded-tr-sm self-end'
                : 'bg-surface-container text-on-surface rounded-tl-sm self-start'
                }`}
            >
              <p 
                className="text-xs md:text-sm font-body-md whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }}
              />
            </div>
          ))}
          {isLoading && (
            <div className="bg-surface-container text-on-surface rounded-2xl rounded-tl-sm p-3 self-start max-w-[80%] flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-xs md:text-sm font-body-md opacity-70">Typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area or Booking Form */}
        {showBookingForm ? (
          <div className="p-4 bg-surface border-t border-outline/20">
            <h4 className="text-sm font-bold text-primary mb-2">Book your visit to continue:</h4>
            <form onSubmit={handleBookingSubmit} className="flex flex-col gap-2">
              <input type="text" placeholder="Name" required pattern="[A-Za-z\s]{3,50}" title="Name must contain only alphabets and spaces (min 3 characters)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-surface-container rounded-md px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
              <input type="tel" placeholder="Phone (10 digits)" required pattern="[0-9]{10}" title="Must be exactly 10 digits" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="bg-surface-container rounded-md px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
              <select value={formData.interest} onChange={e => setFormData({ ...formData, interest: e.target.value })} className="bg-surface-container rounded-md px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary">
                <option>Apartments</option>
                <option>Villas</option>
                <option>Commercial</option>
                <option>Plots</option>
              </select>
              <button type="submit" disabled={isLoading} className="bg-primary text-on-primary rounded-md py-2 text-xs font-bold hover:bg-primary/90 mt-1">
                {isLoading ? 'Submitting...' : 'Submit & Continue'}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-3 md:p-4 bg-surface border-t border-outline/20 flex flex-col gap-2">
            {/* Suggested Questions */}
            {messages.length < 5 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {suggestedQuestions.map((q, i) => (
                  <button key={i} onClick={() => handleSendMessage(q)} className="whitespace-nowrap bg-primary/10 hover:bg-primary/20 text-primary text-[10px] md:text-xs px-3 py-1.5 rounded-full transition-colors border border-primary/20">
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 md:gap-2 bg-surface-container rounded-full px-3 py-1.5 md:px-4 md:py-2 focus-within:ring-2 focus-within:ring-primary transition-all">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none focus:outline-none text-on-surface text-xs md:text-sm font-body-md py-2 w-full"
              />
              <button
                onClick={toggleListen}
                className={`p-1.5 md:p-2 rounded-full transition-colors ${isListening ? 'bg-error text-on-error animate-pulse' : 'text-primary hover:bg-primary/10'
                  }`}
                title="Voice Input"
              >
                <Mic size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
                className="p-1.5 md:p-2 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <Send size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 ${showIcon && !isOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'
          }`}
      >
        <span className="font-bold text-xl md:text-2xl">H</span>
      </button>
    </div>
  );
}
