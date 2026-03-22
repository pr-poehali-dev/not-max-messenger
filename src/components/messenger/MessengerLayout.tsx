import { useState } from "react";
import { User } from "@/pages/Index";
import { mockChats, Chat } from "@/data/mockData";
import Sidebar from "./Sidebar";
import ChatList from "./ChatList";
import ChatView from "./ChatView";
import SearchScreen from "./SearchScreen";
import ContactsScreen from "./ContactsScreen";
import ProfileScreen from "./ProfileScreen";

type Tab = "chats" | "groups" | "channels" | "contacts" | "search" | "profile";

type Props = {
  currentUser: User;
  onLogout: () => void;
};

const MessengerLayout = ({ currentUser, onLogout }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>(mockChats);

  const filteredChats = chats.filter(c => {
    if (activeTab === "chats") return c.type === "chat";
    if (activeTab === "groups") return c.type === "group";
    if (activeTab === "channels") return c.type === "channel";
    return false;
  });

  const handleSendMessage = (chatId: string, text: string) => {
    setChats(prev => prev.map(c => {
      if (c.id !== chatId) return c;
      const newMsg = {
        id: "m" + Date.now(),
        senderId: "me",
        text,
        time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };
      return { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastTime: newMsg.time, unread: 0 };
    }));
  };

  if (activeChat) {
    return (
      <div className="h-screen w-full max-w-[390px] mx-auto bg-nm-bg flex flex-col">
        <ChatView
          chat={activeChat}
          currentUser={currentUser}
          onBack={() => setActiveChat(null)}
          onSend={(text) => handleSendMessage(activeChat.id, text)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-[390px] mx-auto bg-nm-bg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 bg-nm-bg border-b border-nm-border/30">
        <h1 className="text-white text-xl font-bold">
          {activeTab === "chats" && "Сообщения"}
          {activeTab === "groups" && "Группы"}
          {activeTab === "channels" && "Каналы"}
          {activeTab === "contacts" && "Контакты"}
          {activeTab === "search" && "Поиск"}
          {activeTab === "profile" && "Профиль"}
        </h1>
        {(activeTab === "chats" || activeTab === "groups" || activeTab === "channels") && (
          <button className="w-9 h-9 rounded-full bg-nm-surface flex items-center justify-center text-nm-accent">
            <span className="text-xl">✏️</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {(activeTab === "chats" || activeTab === "groups" || activeTab === "channels") && (
          <ChatList chats={filteredChats} onSelect={setActiveChat} tab={activeTab} />
        )}
        {activeTab === "contacts" && <ContactsScreen currentUser={currentUser} onChat={(contact) => {
          const existing = chats.find(c => c.name === contact.name);
          if (existing) { setActiveChat(existing); setActiveTab("chats"); }
        }} />}
        {activeTab === "search" && <SearchScreen chats={chats} onSelect={(c) => { setActiveChat(c); }} />}
        {activeTab === "profile" && <ProfileScreen user={currentUser} onLogout={onLogout} />}
      </div>

      {/* Bottom Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default MessengerLayout;
