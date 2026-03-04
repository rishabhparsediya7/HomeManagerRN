import React, {createContext, useContext, useState, useCallback} from 'react';
import {ExpenseDataProps} from '../screens/home';

interface HomeContextType {
  recentExpenses: ExpenseDataProps[];
  setRecentExpenses: React.Dispatch<React.SetStateAction<ExpenseDataProps[]>>;
  unreadNotifications: number;
  setUnreadNotifications: React.Dispatch<React.SetStateAction<number>>;
  addExpenseToRecent: (expense: ExpenseDataProps) => void;
  decrementUnreadNotifications: () => void;
  clearUnreadNotifications: () => void;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

const MAX_RECENT_EXPENSES = 5;

export const HomeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [recentExpenses, setRecentExpenses] = useState<ExpenseDataProps[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const addExpenseToRecent = useCallback((expense: ExpenseDataProps) => {
    setRecentExpenses(prev => [expense, ...prev].slice(0, MAX_RECENT_EXPENSES));
  }, []);

  const decrementUnreadNotifications = useCallback(() => {
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  }, []);

  const clearUnreadNotifications = useCallback(() => {
    setUnreadNotifications(0);
  }, []);

  return (
    <HomeContext.Provider
      value={{
        recentExpenses,
        setRecentExpenses,
        unreadNotifications,
        setUnreadNotifications,
        addExpenseToRecent,
        decrementUnreadNotifications,
        clearUnreadNotifications,
      }}>
      {children}
    </HomeContext.Provider>
  );
};

export const useHomeContext = (): HomeContextType => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHomeContext must be used within a HomeProvider');
  }
  return context;
};
