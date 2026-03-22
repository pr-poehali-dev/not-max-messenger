import { useState } from "react";
import { Chat, mockContacts } from "@/data/mockData";
import Icon from "@/components/ui/icon";

type Props = {
  chats: Chat[];
  onSelect: (chat: Chat) => void;
};

const SearchScreen = ({ chats, onSelect }: Props) => {
  const [query, setQuery] = useState("");

  const q = query.toLowerCase().trim();

  const filteredChats = q
    ? chats.filter(c => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q))
    : [];

  const filteredContacts = q
    ? mockContacts.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.phone.includes(q)
      )
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="px-4 py-3 border-b border-nm-border/20">
        <div className="flex items-center gap-2 bg-nm-surface rounded-2xl px-3 py-2.5">
          <Icon name="Search" size={16} className="text-nm-muted flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск чатов, групп, каналов, контактов..."
            className="flex-1 bg-transparent text-white text-sm placeholder:text-nm-muted focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-nm-muted">
              <Icon name="X" size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!q && (
          <div className="flex flex-col items-center justify-center h-full text-nm-muted gap-3 pb-20">
            <span className="text-5xl">🔍</span>
            <p className="text-sm">Найдите людей и чаты</p>
            <p className="text-xs opacity-60">Введите имя, @username или номер</p>
          </div>
        )}

        {q && filteredChats.length === 0 && filteredContacts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-nm-muted gap-3 pb-20">
            <span className="text-4xl">😕</span>
            <p className="text-sm">Ничего не найдено</p>
            <p className="text-xs opacity-60">Попробуйте другой запрос</p>
          </div>
        )}

        {filteredChats.length > 0 && (
          <>
            <div className="px-4 py-2 text-nm-muted text-xs font-semibold uppercase tracking-wider">Чаты и каналы</div>
            {filteredChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => onSelect(chat)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-nm-surface/50 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-nm-surface flex items-center justify-center text-xl border border-nm-border/30">
                  {chat.avatar}
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">{chat.name}</p>
                  <p className="text-nm-muted text-xs truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </>
        )}

        {filteredContacts.length > 0 && (
          <>
            <div className="px-4 py-2 text-nm-muted text-xs font-semibold uppercase tracking-wider">Люди</div>
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-nm-surface/50 transition-colors"
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-nm-surface flex items-center justify-center text-xl border border-nm-border/30">
                    {contact.avatar}
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-nm-bg" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">{contact.name}</p>
                  <p className="text-nm-accent text-xs">@{contact.username}</p>
                </div>
                <button className="text-nm-accent">
                  <Icon name="MessageCircle" size={18} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
