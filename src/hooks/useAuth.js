export const useAuth = () => {
  return {
    user: null,
    loading: false,
    isAdmin: false,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => {}
  };
};

export const AuthProvider = ({ children }) => {
  return children;
};
