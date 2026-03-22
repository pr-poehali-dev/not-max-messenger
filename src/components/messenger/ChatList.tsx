import { Chat } from "@/data/mockData";

type Props = {
  chats: Chat[];
  onSelect: (chat: Chat) => void;
  tab: string;
};

const ChatList = ({ chats, onSelect, tab }: Props) => {
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-nm-muted gap-3">
        <span className="text-5xl">
          {tab === "groups" ? "👥" : tab === "channels" ? "📢" : "💬"}
        </span>
        <p className="text-sm">Пока ничего нет</p>
        <p className="text-xs opacity-60">
          {tab === "groups" ? "Создайте первую группу" : tab === "channels" ? "Подпишитесь на каналы" : "Начните переписку"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto h-full">
      {chats.map((chat, i) => (
        <button
          key={chat.id}
          onClick={() => onSelect(chat)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-nm-surface/50 transition-colors border-b border-nm-border/10 animate-fade-in"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-nm-surface flex items-center justify-center text-2xl border border-nm-border/30">
              {chat.avatar}
            </div>
            {chat.type === "chat" && chat.online && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-nm-bg" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-white font-semibold text-sm truncate">{chat.name}</span>
              <span className="text-nm-muted text-xs flex-shrink-0 ml-2">{chat.lastTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-nm-muted text-xs truncate pr-2">
                {chat.lastMessage}
              </span>
              {chat.unread > 0 && (
                <span className="flex-shrink-0 min-w-[20px] h-5 rounded-full bg-nm-accent text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {chat.unread > 99 ? "99+" : chat.unread}
                </span>
              )}
            </div>
            {chat.type !== "chat" && (
              <span className="text-nm-muted/50 text-[10px]">
                {chat.type === "group" ? `${chat.members} участников` : `${chat.subscribers?.toLocaleString("ru")} подписчиков`}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatList;
