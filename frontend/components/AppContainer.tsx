'use client';

import React, { useState, useCallback } from 'react';
import Header from './Header';
import UrlInputBar from './UrlInputBar';
import ResultFeed from './ResultFeed';
import { CardData, CardStatus } from '@/types';

export default function AppContainer() {
  const [cards, setCards] = useState<CardData[]>([]);

  const handleUrlSubmit = useCallback(async (url: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Prepend skeleton card
    const newCard: CardData = {
      id,
      url,
      status: 'PARSING_PENDING',
      timestamp: new Date().toISOString(),
    };
    
    setCards(prev => [newCard, ...prev]);

    // Simulate parsing logic
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success response
      setCards(prev => prev.map(card => 
        card.id === id ? {
          ...card,
          status: 'DISPLAY_READY',
          title: url.includes('youtube') ? 'How to build a Vibe-Engine' : 'The Future of AI Agents',
          author: url.includes('youtube') ? '@TechGuru' : '@OpenSourceAdvocate',
          summary: [
            'Explores the fundamental architecture of modern vibe-based systems.',
            'Highlights the importance of low-latency user feedback loops.',
            'Demonstrates how to integrate LLMs into single-page interfaces.',
            'Discusses the shift from configuration-heavy to zero-config UIs.'
          ],
          metadata: url.includes('youtube') ? 'YouTube • 12:45' : 'Twitter • 2.4k Likes'
        } : card
      ));
    } catch (err) {
      setCards(prev => prev.map(card => 
        card.id === id ? { ...card, status: 'PARSING_FAILED' } : card
      ));
    }
  }, []);

  const handleRetry = (id: string, url: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    handleUrlSubmit(url);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Header />
      <div className="sticky top-0 z-10 bg-slate-50 pt-4 pb-8">
        <UrlInputBar onUrlSubmit={handleUrlSubmit} />
      </div>
      <ResultFeed cards={cards} onRetry={handleRetry} />
    </div>
  );
}
