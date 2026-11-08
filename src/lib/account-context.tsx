import { createContext, useContext } from 'react';
export const AccountContext = createContext<{ signedIn: boolean }>({ signedIn: false });
export const useAccount = () => useContext(AccountContext);