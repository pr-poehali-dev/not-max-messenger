import { useState, useRef, useEffect } from "react";
import { Chat } from "@/data/mockData";
import { User } from "@/pages/Index";
import Icon from "@/components/ui/icon";

type Props = {
  chat: Chat;
  currentUser: User;
  onBack: () => void;
  onSend: (text: string) => void;
};

const ChatView = ({ chat, currentUser, onBack, onSend }: Props) => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState(chat.messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    const newMsg = {
      id: "m" + Date.now(),
      senderId: "me",
      text: text.trim(),
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setMessages(prev => [...prev, newMsg]);
    onSend(text.trim());
    setText("");

    if (chat.type === "chat") {
      setTimeout(() => {
        const replies = [
          "Понял, понял 👍", "Окей!", "Спасибо за сообщение!", "Скоро отвечу 🙏",
          "Интересно!", "Договорились!", "Хорошо, сделаю"
        ];
        const reply = {
          id: "m" + Date.now() + 1,
          senderId: chat.id,
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
          read: false,
        };
        setMessages(prev => [...prev, reply]);
      }, 1000 + Math.random() * 1500);
    }
  };

  const isChannel = chat.type === "channel";

  return (
    <div className="flex flex-col h-full bg-nm-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-nm-surface border-b border-nm-border/30">
        <button onClick={onBack} className="text-nm-accent mr-1">
          <Icon name="ChevronLeft" size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-nm-bg flex items-center justify-center text-xl border border-nm-border/30">
          {chat.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{chat.name}</p>
          <p className="text-nm-muted text-xs">
            {chat.type === "chat" && (chat.online ? "онлайн" : "был(а) недавно")}
            {chat.type === "group" && `${chat.members} участников`}
            {chat.type === "channel" && `${chat.subscribers?.toLocaleString("ru")} подписчиков`}
          </p>
        </div>
        <button className="w-9 h-9 rounded-full bg-nm-bg flex items-center justify-center text-nm-muted">
          <Icon name="Phone" size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === "me";
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}
              style={{ animationDelay: `${i * 20}ms` }}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                  isMe
                    ? "bg-nm-accent text-white rounded-br-sm"
                    : "bg-nm-surface text-white rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "justify-end" : "justify-start"}`}>
                  <span className="text-[10px] opacity-60">{msg.time}</span>
                  {isMe && (
                    <Icon name={msg.read ? "CheckCheck" : "Check"} size={12} className="opacity-60" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isChannel ? (
        <div className="flex items-end gap-2 px-3 py-3 pb-6 bg-nm-surface border-t border-nm-border/30">
          <button className="w-9 h-9 flex items-center justify-center text-nm-muted flex-shrink-0">
            <Icon name="Paperclip" size={20} />
          </button>
          <div className="flex-1 bg-nm-bg rounded-3xl px-4 py-2.5 flex items-center min-h-[40px]">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Сообщение..."
              rows={1}
              className="w-full bg-transparent text-white text-sm placeholder:text-nm-muted resize-none focus:outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              text.trim() ? "bg-nm-accent text-white" : "bg-nm-border text-nm-muted"
            }`}
          >
            <Icon name="Send" size={16} />
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 pb-6 bg-nm-surface border-t border-nm-border/30 text-center">
          <p className="text-nm-muted text-sm">Только для чтения</p>
        </div>
      )}
    </div>
  );
};

export default ChatView;
