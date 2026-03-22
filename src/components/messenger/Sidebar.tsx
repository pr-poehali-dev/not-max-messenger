import Icon from "@/components/ui/icon";

type Tab = "chats" | "groups" | "channels" | "contacts" | "search" | "profile";

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: "chats", icon: "MessageCircle", label: "Чаты" },
  { id: "groups", icon: "Users", label: "Группы" },
  { id: "channels", icon: "Radio", label: "Каналы" },
  { id: "contacts", icon: "Contact", label: "Контакты" },
  { id: "search", icon: "Search", label: "Поиск" },
  { id: "profile", icon: "User", label: "Профиль" },
];

const Sidebar = ({ activeTab, onTabChange }: Props) => {
  return (
    <div className="flex items-center justify-around px-2 py-2 pb-6 bg-nm-surface border-t border-nm-border/30">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${
            activeTab === tab.id
              ? "text-nm-accent"
              : "text-nm-muted"
          }`}
        >
          <Icon
            name={tab.icon}
            size={22}
            className={activeTab === tab.id ? "text-nm-accent" : "text-nm-muted"}
          />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
