import { PropsWithChildren, createContext, useContext, useState } from 'react';

type UserContextType = {
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  isVerified: boolean;
  updateUser: (userData: Partial<Omit<UserContextType, 'updateUser'>>) => void;
  clearUser: () => void;
};

const UserContext = createContext<UserContextType>({
  name: null,
  email: null,
  phoneNumber: null,
  isVerified: false,
  updateUser: () => {},
  clearUser: () => {},
});

export default function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<Omit<UserContextType, 'updateUser' | 'clearUser'>>({
    name: null,
    email: null,
    phoneNumber: null,
    isVerified: false,
  });

  const updateUser = (userData: Partial<Omit<UserContextType, 'updateUser'>>) => {
    console.log('🚀 ~ updateUser ~ userData:', userData);
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };

  const clearUser = () => {
    setUser({
      name: null,
      email: null,
      phoneNumber: null,
      isVerified: false,
    });
  };

  return (
    <UserContext.Provider value={{ ...user, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
