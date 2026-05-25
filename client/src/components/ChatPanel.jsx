import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export function ChatPanel({ messages = [], onSend, disabled, selfName, placeholder = 'Type a message…' }) {
  const [text, setText] = useState('');
  const scroller = useRef(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  function submit(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t || disabled) return;
    onSend?.(t);
    setText('');
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scroller} className="flex-1 overflow-y-auto nice-scroll px-3 py-2 space-y-2">
        {messages.length === 0 && (
          <div className="text-[12px] font-mono opacity-50 italic text-center py-6">
            No messages yet — say hi.
          </div>
        )}
        {messages.map((m) => {
          const mine = m.name === selfName;
          return (
            <div key={m.id} className={`flex gap-2 ${mine ? 'flex-row-reverse text-right' : ''}`}>
              <Avatar name={m.name} src={m.avatar} size={24} />
              <div className={`max-w-[80%] ${mine ? 'items-end' : ''} flex flex-col`}>
                <div className="text-[10px] uppercase tracking-widest opacity-60 font-mono">
                  {mine ? 'you' : m.name}
                </div>
                <div className={`mt-0.5 px-2.5 py-1.5 rounded-md font-mono text-sm border
                  ${mine
                    ? 'bg-neon-orange text-ink-900 border-ink-900'
                    : 'bg-cream-50 dark:bg-terminal-700 border-ink-900/30 dark:border-terminal-500'}`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={submit} className="border-t border-ink-900/30 dark:border-terminal-500 p-2 flex gap-2">
        <input
          className="input"
          placeholder={disabled ? 'You are muted' : placeholder}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
        />
        <button type="submit" className="btn btn-primary btn-sm px-3" disabled={disabled || !text.trim()}>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
