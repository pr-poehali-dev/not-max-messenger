import { useState } from "react";
import AuthScreen from "@/components/messenger/AuthScreen";
import MessengerLayout from "@/components/messenger/MessengerLayout";

export type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  phone: string;
  bio: string;
  online: boolean;
};

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  if (!currentUser) {
    return <AuthScreen onAuth={setCurrentUser} />;
  }

  return <MessengerLayout currentUser={currentUser} onLogout={() => setCurrentUser(null)} />;
};

export default Index;
