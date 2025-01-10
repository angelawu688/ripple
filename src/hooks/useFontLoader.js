import { useState, useEffect } from 'react';
import { useFonts } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import { FONTS } from '../config/fonts'

export function useFontLoader() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [fontsLoaded] = useFonts(FONTS);

    useEffect(() => {
        async function preventAutoHide() {
            try {
                await SplashScreen.preventAutoHideAsync();
            } catch (e) {
                console.warn('Error preventing splash screen hide')
            }
        }
        preventAutoHide();
    }, [])

    useEffect(() => {
        async function prepare() {
            try {
                if (fontsLoaded) {
                    setAppIsReady(true);
                }
            } catch (error) {
                console.error('Error loading fonts:', error);
            }
        }

        prepare();
    }, [fontsLoaded]);

    useEffect(() => {
        if (appIsReady) {
            async function hideSplash() {
                try {
                    await SplashScreen.hideAsync();
                } catch (e) {
                    console.warn('Error hiding the splash screen', e)
                }
            }
            hideSplash();
            // requestAnimationFrame(async () => {
            //     await SplashScreen.hideAsync().catch(console.warn);
            // });
        }
    }, [appIsReady]);

    return { appIsReady };
}
