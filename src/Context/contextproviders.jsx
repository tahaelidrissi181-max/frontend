import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios"; 

const StateContext = createContext({
  user: null,
  token: null,
  loading: true,
  setUser: () => {},
  setToken: () => {},
});

export const ContextProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState(
    localStorage.getItem("token")
  );

  const setUser = (user) => {
    setUserState(user);
  };

  const setToken = (token) => {
    setTokenState(token);
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  };

  const isAuth = async () => {
    if (!token) {
      setLoading(false); // no token → no need to check, stop loading
      return;
    }

    try {
      const res = await api.get("/me", {
        headers: {
          'access_token': token,
        },
      });
      setUser(res.data.user);
    } catch (err) {
      console.error("Auth failed");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false); // always stop loading when done
    }
  };

  useEffect(() => {
    isAuth();
  }, []);  // run once on mount, not on every token change

  return (
    <StateContext.Provider
      value={{
        user,
        token,
        loading,
        setUser,
        setToken,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);