import { useContext } from "react"
import { userContext } from "../context/UserContext"

export const useAuthNavigation = () => {
    const { user, userData, isLoading } = useContext(userContext)
    const isAuthenticated = user && user.emailVerified

    return {
        isLoading,
        isAuthenticated
    }
}