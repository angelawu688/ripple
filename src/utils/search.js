import { collection, query, where, getDocs, limit, startAfter, getFirestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc, orderBy, } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

// taking the title and tags of a post, we generate the keywords
// all keywords are lowercase, delimited (by nonletters), and deduped
export const generateKeywords = (title, tags, limit = 20, startAfter = null) => {
    const titleWords = title.toLowerCase().split(/[^a-zA-Z]+/).filter(word => word)

    const tagWords = tags.map(tag => tag.toLowerCase());

    return Array.from(new Set([...titleWords, ...tagWords]))
}


// this performs a keyword search on the given searchQuery
// NEED TO ADD
//  support for getting more
//  refresh support, etc.
export const searchByKeyword = async (searchQuery, limitNum = 20, startAfterListing = null) => {
    try {
        let q = query(
            collection(db, 'listings'),
            where('keywords', 'array-contains', searchQuery.toLowerCase()),
            where('sold', '==', false), // only available listings

            // this requires composite indexing, which we can do in the console
            // orderBy('createdAt', 'desc'), // most recent first
            limit(limitNum)
        );

        if (startAfterListing) {
            q = query(q, startAfter(startAfter));
        }

        const querySnapshot = await getDocs(q)
        const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        return { results, lastVisible };
    } catch (e) {
        console.log(e)
        throw e
    }
}


// grabs and returns a given user's recent searches
export const fetchRecentSearches = async (userID) => {
    try {
        const userDocRef = doc(db, "users", userID);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            return userData.recentSearches || []
        }
        return [] // catch all
    } catch (error) {
        console.error("Error fetching recent searches:", error);
        throw error
    }
}

// saves a given search to the users
export const saveRecentSearchFirebase = async (searchQuery, userID) => {
    try {
        const userDocRef = doc(db, "users", userID);
        await updateDoc(userDocRef, {
            recentSearches: arrayUnion(searchQuery)
        });
    } catch (e) {
        console.log(e)
        throw e
    }
}

export const removeItemFromRecentSearchesFirebase = async (item, userID) => {
    const userDocRef = doc(db, "users", userID);
    await updateDoc(userDocRef, {
        recentSearches: arrayRemove(item)
    });
}


export const EmptyMessage = ({ message }) => {
    return (
        <View style={{ width: '100%', height: '80%', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
            <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: 'inter', fontWeight: '500', maxWidth: '90%', }}>
                {message}
            </Text>
        </View>
    )
}

export const RecentSearchItem = ({ item, onSelect, onRemove }) => (
    <View style={styles.recentSearchItem}>
        <TouchableOpacity style={styles.recentSearchButton} onPress={() => onSelect(item)}>
            <Ionicons name="time-outline" size={24} color="#000" />
            <Text style={styles.recentSearchText}>{item}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onRemove(item)}>
            <Ionicons name="close-outline" size={24} color="#000" />
        </TouchableOpacity>
    </View>
);

export const RecentSearchSkeletonLoader = () => {
    return (
        <View>
            {[...Array(8)].map((_, index) => (
                <MotiView
                    key={index}
                    from={{ opacity: 0.5 }}
                    animate={{ opacity: 0.7 }}
                    transition={{
                        type: 'timing',
                        duration: 750,
                        loop: true,
                    }}
                    style={styles.skeletonItem}
                />
            ))}
        </View>
    );
};


// generates keywords for a user
export const generateUserKeywords = (name) => {
    const nameArray = name.toLowerCase().split(' ');
    const keywords = new Set();

    // full name
    keywords.add(name.toLowerCase());

    // each word
    nameArray.forEach(word => keywords.add(word));

    // partial matching
    nameArray.forEach(word => {
        let partial = '';
        word.split('').forEach(letter => {
            partial += letter;
            keywords.add(partial);
        });
    });

    return Array.from(keywords);
};

const styles = StyleSheet.create({
    recentSearchItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    recentSearchButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    recentSearchText: {
        marginLeft: 8,
        fontSize: 16,
    },
    skeletonItem: {
        height: 45,
        backgroundColor: '#E0E0E0',
        borderRadius: 8,
        marginVertical: 6,
        width: '100%',
    },
})