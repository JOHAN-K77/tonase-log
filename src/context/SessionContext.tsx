import { createContext, useContext, useState } from "react";

export type SessionType = {
  lokasi: string | null;
  role: string;
};

type SessionContextType = {
  sessionActive: SessionType | null;
  setSessionActive: (session: SessionType | null) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }) => {
  const [sessionActive, setSessionActive] = useState<SessionType | null>(null);
  return (
    <SessionContext.Provider value={{ sessionActive, setSessionActive }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);