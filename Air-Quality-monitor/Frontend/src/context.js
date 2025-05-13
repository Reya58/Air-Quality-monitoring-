// context/UserContext.js
import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [channelId, setChannelId] = useState('');

  const setUserChannelId = (id) => {
    setChannelId(id);
  };

  return (
    <UserContext.Provider value={{ channelId, setUserChannelId }}>
      {children}
    </UserContext.Provider>
  );
};
