import React, { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext(null);

/** 
 * The general way that this works is that the entire app is wrapped in a toast context, so that we can access it in every component
 * the actual state of the toast is handled here, the design and animation of the toast is handlded in components/toasts/CustomToast
*/

export const ToastProvider = ({ children }) => {
    const [toastMessage, setToastMessage] = useState('');
    const [isToastVisible, setIsToastVisible] = useState(false);
    const [type, setType] = useState('')

    // show the toast for a default of 2s
    const showToast = useCallback((message, type, duration = 2000) => {
        setToastMessage(message);
        setType(type)
        setIsToastVisible(true);
        setTimeout(() => setIsToastVisible(false), duration);
    }, []);

    const hideToast = () => {
        setIsToastVisible(false)
    }

    return (
        <ToastContext.Provider value={{ showToast, hideToast, isToastVisible, toastMessage, type }}>
            {children}
        </ToastContext.Provider>
    );
};