import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const { user, loading, error, isAuthenticated, login, register, logout } = useAuthContext();
  return { user, loading, error, isAuthenticated, login, register, logout };
}
