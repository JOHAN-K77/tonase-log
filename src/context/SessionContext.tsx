import { createContext, useContext, useState } from "react";

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [sessionActive, setSessionActive] = useState<{lokasi: string | null, role: string}>(null);
  return (
    <SessionContext.Provider value={{ sessionActive, setSessionActive }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);