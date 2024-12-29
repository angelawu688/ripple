import { useEffect, useContext } from 'react';
import { userContext } from '../context/UserContext';
import { registerForPushNotificationsAsync } from '../utils/notifications';

export function usePushNotifications() {
    const { isLoading, user, userData } = useContext(userContext);

    useEffect(() => {
        async function setupPushNotifications() {
            if (!isLoading && user && userData) {
                await registerForPushNotificationsAsync(user.uid);
            }
        }

        setupPushNotifications();
    }, [isLoading, user, userData]);

    return { isLoading };
}