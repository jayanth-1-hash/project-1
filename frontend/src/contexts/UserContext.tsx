import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface UserContextType {
  isRegistered: boolean;
  userName: string;
  userPhone: string;
  registerUser: (name: string, phone: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const registerUser = (name: string, phone: string) => {
    setIsRegistered(true);
    setUserName(name);
    setUserPhone(phone);
  };

  return (
    <UserContext.Provider value={{ isRegistered, userName, userPhone, registerUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
