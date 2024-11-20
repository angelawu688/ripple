import { useEffect, useRef, useState, useContext } from "react"
import { FlatList, Keyboard, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, View } from "react-native"
import { Ionicons } from '@expo/vector-icons';
import ForYou from "./ForYou";
import { collection, query as firestoreQuery, where, getDocs, getFirestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { userContext } from '../../../context/UserContext.js';
import { colors } from "../../../colors";
import ListingsList from '../../../components/ListingsList'


const Search = ({ navigation }) => {
    // TODO add autocomplete API
    // probably algolia
    const [recentSearches, setRecentSearches] = useState([]);
    const [query, setQuery] = useState('')
    const [displayResults, setDisplayResults] = useState(false)
    const [searchResults, setSearchResults] = useState([])

    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useContext(userContext);

    const [loadingRecentSearches, setLoadingRecentSearches] = useState(false)
    const db = getFirestore();



    // search input ref, will autoselect when we open
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        if (user) {
            fetchRecentSearches();
        }
    }, [user]);


    // TODO
    // use some sort of caching for this so that we are not fetching this on every component render
    // maybe only grab like the first 10 or something?
    // -- we are handling this below, but if user has 1000 recent searches, we are still grabbing 1000 items
    const fetchRecentSearches = async () => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setRecentSearches(userData.recentSearches || []);
            }
        } catch (error) {
            console.error("Error fetching recent searches:", error);
        }
    }

    // saves a search to the user's recent searches
    const saveRecentSearch = async (searchQuery) => {
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        try {
            // backend update
            await updateDoc(userDocRef, {
                recentSearches: arrayUnion(searchQuery)
            });

            // we dont need to grab them again on the frontend, we already have it!
            // fetchRecentSearches(); 
            console.log(recentSearches, searchQuery)

            //   frontend update. Add it to the front. This way we dont need to grab the results again
            setRecentSearches((prevSearches) => [searchQuery, ...prevSearches]);

        } catch (error) {
            console.error("Error saving recent search:", error);
        }
    };




    const handleRemoveItemFromRecentSearches = async (item) => {
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        try {
            await updateDoc(userDocRef, {
                recentSearches: arrayRemove(item)
            });

            // frontend update
            setRecentSearches(prev => prev.filter(search => search !== item));
        } catch (error) {
            console.error("Error removing recent search:", error);
        }
    }



    const handleSearchSelect = async (item) => {
        setQuery(item)
        await handleSearch()
    }


    const handleSearch = async () => {
        if (isLoading || query.trim() === '') { // prevent duplicate requests
            return
        }

        setIsLoading(true)
        Keyboard.dismiss()
        try {
            const q = firestoreQuery(collection(db, "listings"), where("title", ">=", query), where("title", "<=", query + '\uf8ff'));
            const querySnapshot = await getDocs(q);
            const results = querySnapshot.docs.map(doc => ({
                listingID: doc.id,
                ...doc.data(),
            }));
            setSearchResults(results);
            setDisplayResults(true);
            await saveRecentSearch(query);
        } catch (e) {
            setErrorMessage(e.message)
            console.log(e)
        } finally {
            setIsLoading(false)
        }
    }

    const RecentSearchItem = ({ item }) => (
        <View style={styles.recentSearchItem}>
            <TouchableOpacity style={styles.recentSearchButton} onPress={() => handleSearchSelect(item)}>
                <Ionicons name="time-outline" size={24} color="#000" />
                <Text style={styles.recentSearchText}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveItemFromRecentSearches(item)}>
                <Ionicons name="close-outline" size={24} color="#000" />
            </TouchableOpacity>
        </View>
    );

    const SearchResults = ({ query, results }) => {
        return (
            <ListingsList listings={results} navigation={navigation} />
        )
    }


    // <View>
    //     <FlatList
    //         data={results}
    //         keyExtractor={(item) => item.listingID}
    //         renderItem={({ item }) => (
    //             <TouchableOpacity
    //                 style={styles.resultItem}
    //                 onPress={() => navigation.navigate('ListingScreen', { listingID: item.listingID })}
    //             >
    //                 <Text>{item.title}</Text>
    //                 <Text>${item.price}</Text>
    //             </TouchableOpacity>
    //         )}
    //     />
    // </View>
    // );


    return (
        <View style={styles.container}>

            <TextInput
                ref={inputRef}
                value={query}
                onChangeText={(text) => {
                    setQuery(text);
                    setDisplayResults(false); // will hide results
                }}
                style={[styles.input, styles.shadow]}
                placeholder="What are you looking for?"
                onSubmitEditing={handleSearch}
                returnKeyType="search" // gives us the blue button on keyboard
            />
            {displayResults ? (
                <View>
                    <Text style={styles.resultsHeader}>Results for "{query}"</Text>
                    {searchResults.length > 0 ? (
                        <SearchResults results={searchResults} />
                    ) : (
                        <Text>No results found.</Text>
                    )}
                </View>
            ) : (
                !query && (
                    <View style={{ alignSelf: "center", width: '95%' }}>
                        <Text style={styles.sectionHeader}>Recent searches</Text>

                        <FlatList
                            data={recentSearches.slice(0, 5)}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <RecentSearchItem
                                    item={item}
                                    onSelect={handleSearchSelect}
                                    onRemove={handleRemoveItemFromRecentSearches}
                                />
                            )}
                        />
                    </View>
                )
            )}
        </View>
    );
}


export default Search;

const styles = StyleSheet.create({
    container: {
        flex: 1,


        width: '98%',
        alignSelf: 'center'
    },
    input: {
        height: 40,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 16,
        width: '95%',
        alignSelf: 'center'
    },
    shadow: {
        shadowColor: colors.loginBlue,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "500",
        marginBottom: 8,
    },
    resultsHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        marginLeft: '5%'
    },
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
    resultItem: {
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 8,
    },
    searchBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 16,
    },
    clearButton: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
    }


})