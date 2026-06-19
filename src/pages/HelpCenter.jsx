// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/components/translations';
import BottomNav from '@/components/BottomNav';

export default function HelpCenter() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your SkyPath AI assistant. I can help you with:\n\n• Understanding visa requirements\n• Managing your travel profiles\n• Searching for flights\n• Booking and trip management\n• App features and settings\n\nWhat would you like help with today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Call Anthropic API directly (proxied through Vite in dev)
      const aiRes = await fetch('/anthropic/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 500,
          system: 'You are a helpful AI assistant for SkyPath, a visa-aware flight booking app. The app helps users find flights that work with their passport and visa requirements. Key features: travel profiles with passport/visa info, visa-aware flight search, multi-profile support, trip management, e-visa suggestions. Be helpful, friendly, and concise.',
          messages: [{ role: 'user', content: userMessage }]
        })
      });
      const aiJson = await aiRes.json();
      const response = aiJson.content?.[0]?.text || 'Sorry, I could not get a response.';

      setMessages(prev => [...prev, { role: 'assistant', content: typeof response === 'string' ? response : JSON.stringify(response) }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try asking your question again, or contact our support team if the issue persists.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Settings')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">AI Help Center</h1>
                <p className="text-xs text-slate-500">Get instant help with any question</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <Card className={`max-w-[80%] p-4 ${
              message.role === 'user' 
                ? 'bg-amber-600 text-white border-amber-600' 
                : 'bg-white'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </Card>
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span className="text-sm text-slate-600">Thinking...</span>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (only show at start) */}
      {messages.length === 1 && (
        <div className="max-w-3xl mx-auto px-4 pb-6">
          <p className="text-xs text-slate-500 mb-3">Common questions:</p>
          <div className="grid gap-2">
            {[
              'How do I add a visa to my profile?',
              'Why can\'t I see certain flight routes?',
              'How do I switch between travel profiles?',
              'What are e-visas and visa-on-arrival?'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(suggestion);
                }}
                className="text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors text-sm text-slate-700"
              >
                <Sparkles className="w-3 h-3 inline mr-2 text-amber-500" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-200 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1"
              disabled={loading}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}