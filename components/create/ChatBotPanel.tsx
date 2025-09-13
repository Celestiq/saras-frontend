// frontend/components/create/ChatBotPanel.tsx
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizontal, Bot, User } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Define the structure of a chat message
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

/**
 * A friendly, conversational chatbot panel for users to create their learning plan.
 * This component is self-contained and manages its own state for the conversation.
 */
export default function ChatbotPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm Saras. What would you like to learn about in the next 28 days?",
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to automatically scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // useEffect hook to scroll down when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handles the form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user's message to the state
    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate bot response after a delay
    // In a real app, this is where you would make an API call to your backend
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: `That's a great topic! Generating a 28-day learning path for "${input}". One moment...`,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
      // Here you would also trigger the update of the PlanPreview panel
    }, 1500);
  };

  return (
    <Card className="h-full flex flex-col shadow-lg border-gray-200">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Design Your Book</CardTitle>
      </CardHeader>

      {/* Chat messages area */}
      <CardContent className="flex-grow overflow-y-auto pr-4 space-y-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              {/* Bot Avatar */}
              {message.sender === 'bot' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot size={20} />
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted text-foreground rounded-bl-none'
                  }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>

              {/* User Avatar */}
              {message.sender === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    <User size={20} />
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Bot Typing Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot size={20} />
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center space-x-1.5 bg-muted px-4 py-3 rounded-2xl rounded-bl-none">
              <motion.span
                className="w-2 h-2 bg-foreground/50 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.span
                className="w-2 h-2 bg-foreground/50 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.8, delay: 0.1, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.span
                className="w-2 h-2 bg-foreground/50 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* Empty div to scroll to */}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input form area */}
      <CardFooter className="pt-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-3">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What do you want to learn in the next 28 days?"
            className="flex-1 h-12 rounded-full focus-visible:ring-primary"
            disabled={isLoading}
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90"
            disabled={isLoading || !input.trim()}
          >
            <SendHorizontal className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}