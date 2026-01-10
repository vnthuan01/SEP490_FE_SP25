import { useContext } from 'react';
import { AuthContext } from './AuthContextType';

export const useAuthContext = () => useContext(AuthContext);
