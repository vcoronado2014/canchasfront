import { useState, useEffect } from "react";

import { AuthContext } from "./auth-context";
import { AUTH_STORAGE_KEY } from "./auth-storage";
import { login as loginService } from "./auth-service";

import type {
    User,
    Club,
    Cliente,
    LoginResponse,
    AuthContextType,
} from "./auth-types";

interface Props {
    children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {

    const [token, setToken] = useState<string | null>(null);

    const [tipo, setTipo] = useState<string>();

    const [user, setUser] = useState<User>();

    const [club, setClub] = useState<Club>();

    const [cliente, setCliente] = useState<Cliente>();

    useEffect(() => {

        const data = localStorage.getItem(AUTH_STORAGE_KEY);

        if (!data)
            return;

        const auth = JSON.parse(data) as LoginResponse;

        setToken(auth.token);

        setTipo(auth.tipo);

        setUser(auth.user);

        setClub(auth.club);

        setCliente(auth.cliente);

    }, []);

    async function login(
        email: string,
        password: string
    ): Promise<LoginResponse> {

        const response = await loginService(
            email,
            password
        );

        console.log(response);

        setToken(response.token);
        setTipo(response.tipo);
        setUser(response.user);
        setClub(response.club);
        setCliente(response.cliente);

        localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify(response)
        );

        return response;
    }

    function logout() {

        setToken(null);

        setTipo(undefined);

        setUser(undefined);

        setClub(undefined);

        setCliente(undefined);

        localStorage.removeItem(AUTH_STORAGE_KEY);

    }

    const value: AuthContextType = {
        token,

        tipo,

        user,

        club,

        cliente,

        isAuthenticated: !!token,

        login,

        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

}