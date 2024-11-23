// unused?
import { Text, View } from "react-native"
import {doc, getFirestore, setDoc} from "firebase/firestore";

const handleCreateListing = async () => {
    setIsLoading(true)
    try {
        const db = getFirestore();
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            createdAt: new Date(),
            major: major,
            concentration: concentration,
            gradYear: gradYear
            // profile photo requires firebase storage
        });
        setUser(user); // this will navigate to the home page

    } catch (error) {
        setErrorMessage(error.message);
    } finally {
        setIsLoading(false)
    }
}

const SellScreen = () => {
    return (
        <View>
            <Text>
                Sell screen
            </Text>
        </View>
    )
}

export default SellScreen