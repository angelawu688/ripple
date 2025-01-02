import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "../context/ToastContext";
import { UserProvider } from "../context/UserContext";
import { UnreadProvider } from "../context/UnreadContext";

export function AppProviders({ children }) {
    return (
        <SafeAreaProvider>
            <UserProvider>
                <ToastProvider>
                    <UnreadProvider>
                        {children}
                    </UnreadProvider>
                </ToastProvider>
            </UserProvider>
        </SafeAreaProvider>
    );
}