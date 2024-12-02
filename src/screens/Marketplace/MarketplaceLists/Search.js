import { useEffect, useRef, useState, useContext } from "react"
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, View } from "react-native"
import { Ionicons } from '@expo/vector-icons';
import ForYou from "./ForYou";
import { collection, query as firestoreQuery, where, getDocs, getFirestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { userContext } from '../../../context/UserContext.js';
import { colors } from "../../../colors";
import ListingsList from '../../../components/ListingsList'
import { MotiView } from 'moti';
import ListingsListSkeletonLoaderFull from '../../../components/ListingsListSkeletonLoaderFull'



const Search = ({ navigation }) => {
    // TODO add autocomplete API
    // probably algolia
    const [recentSearches, setRecentSearches] = useState([]);
    const [query, setQuery] = useState('')
    const [displayResults, setDisplayResults] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [loadingRecentSearches, setLoadingRecentSearches] = useState(false)

    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useContext(userContext);

    const db = getFirestore();

    // search input ref, will autoselect when we open
    // be careful––if we end up putting recent searches in user context this will be an infinite loop
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        if (user) {
            fetchRecentSearches();
        }
    }, [user?.uid]); // this will run less


    // TODO
    // use some sort of caching for this so that we are not fetching this on every component render?
    // -- we are handling this below, but if user has 1000 recent searches, we are still grabbing 1000 items on every render
    const fetchRecentSearches = async () => {
        console.log('fetching')
        setLoadingRecentSearches(true)
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setRecentSearches(userData.recentSearches || []);
            }
        } catch (error) {
            console.error("Error fetching recent searches:", error);
        } finally {
            setLoadingRecentSearches(false)
        }
    }

    // saves a search to the user's recent searches
    const saveRecentSearch = async (searchQuery) => {
        if (!user) return;

        const userDocRef = doc(db, "users", user.uid);
        try {
            // backend update
            // this implementation stores them in the wrong order
            // reversing this on the frontend will take O(n), so there is a potential tradeoff here
            // since reads are cheaper than writes, im just gonna reverse on frontend for now, especially since this array should be someqwhat small
            await updateDoc(userDocRef, {
                recentSearches: arrayUnion(searchQuery)
            });

            // we dont need to grab them again on the frontend, we already have it!
            // fetchRecentSearches(); 

            //   frontend update. Add it to the front. This way we dont need to grab the results again
            // setRecentSearches((prevSearches) => [searchQuery, ...prevSearches]); (more basic version)

            //  this adds a little time complexity but filters out duplicates (the backend does this by default)
            setRecentSearches((prevSearches) => {
                // Remove searchQuery if it exists, then add it to the front
                const updatedSearches = prevSearches.filter((term) => term !== searchQuery);
                return [...updatedSearches, searchQuery]; // this seems backwards (it is) but we reverse the list down below :)
            });

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
        // pass directly, so that we can search. This is just how state works in react
        await handleSearch(item)
    }


    const handleSearch = async (searchQuery = query) => {
        if (isLoading || searchQuery.trim() === '') { // prevent duplicate requests
            return
        }

        setDisplayResults(true);
        setIsLoading(true)
        Keyboard.dismiss()
        try {
            const q = firestoreQuery(collection(db, "listings"), where("title", ">=", searchQuery), where("title", "<=", searchQuery + '\uf8ff'));
            const querySnapshot = await getDocs(q);
            const results = querySnapshot.docs.map(doc => ({
                listingID: doc.id,
                ...doc.data(),
            }));
            setSearchResults(results);
            console.log(results)

            await saveRecentSearch(searchQuery);
        } catch (e) {
            setErrorMessage(e.message)
            console.log(e)
        } finally {
            setTimeout(() => {
                setIsLoading(false)
            }, [1000])

        }
    }

    const RecentSearchItem = ({ item, onSelect, onRemove }) => (
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

    const SearchResults = ({ query, results }) => {
        return (
            <ListingsList listings={results} navigation={navigation} />
        )
    }

    const SkeletonLoader = () => {
        const styles = StyleSheet.create({
            skeletonItem: {
                height: 45,
                backgroundColor: '#E0E0E0',
                borderRadius: 8,
                marginVertical: 6,
                width: '100%',
            },
        })
        // will probably modify this and move it into its own component so keeping is all here for now

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

    const EmptyMessage = ({ message }) => {
        return (
            <View style={{ width: '100%', height: '80%', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                <Text style={{ textAlign: 'center', fontSize: 18, fontFamily: 'inter', fontWeight: '500', maxWidth: '90%', }}>
                    {message}
                </Text>
            </View>
        )
    }


    return (
        <View style={styles.container}>


            {/* top input part */}
            <View style={styles.inputContainer}>
                <TextInput
                    ref={inputRef}
                    value={query}
                    onChangeText={(text) => {
                        setQuery(text);
                        setDisplayResults(false); // will hide results
                    }}
                    style={[styles.input, styles.shadow]}
                    placeholder="What are you looking for?"
                    onSubmitEditing={() => handleSearch(query)}
                    returnKeyType="search" // gives us the blue button on keyboard

                    // i feel like these are really annoying as a user
                    autoComplete="off"
                    autoCorrect={false}
                    autoCapitalize="none"
                />
            </View>

            {/* icons */}
            <View style={styles.iconContainer}>
                {!displayResults && query && (
                    <TouchableOpacity
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                        onPress={() => handleSearch()}>
                        <Ionicons name="search" size={20} color={colors.loginGray} />
                    </TouchableOpacity>
                )}

                {displayResults && query && (
                    <TouchableOpacity
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                        onPress={() => {
                            // clear everything
                            setSearchResults([])
                            setQuery('')
                            setDisplayResults(false)
                        }}>
                        <Ionicons name='close-circle-outline' size={20} color={colors.loginGray} />
                    </TouchableOpacity>
                )}
            </View>



            {/* Lower container */}
            {displayResults ? (
                isLoading ? (
                    <ListingsListSkeletonLoaderFull />
                ) : (
                    searchResults?.length > 0 ? (
                        <ListingsList listings={searchResults} navigation={navigation} />
                    ) : (
                        <EmptyMessage message={'No results found'} />
                    )
                )
            ) : (
                <View style={{ alignSelf: 'center', width: '95%' }}>
                    {query ? (
                        // Autocomplete
                        <Text>Autocomplete for {query}</Text>
                    ) : (
                        // Recent Searches
                        <>
                            <Text style={styles.sectionHeader}>Recent searches</Text>
                            {loadingRecentSearches ? (
                                <SkeletonLoader />
                            ) : (
                                recentSearches.length > 0 ? (
                                    <FlatList
                                        data={[...recentSearches].reverse().slice(0, 8)}
                                        keyExtractor={(item) => item}
                                        renderItem={({ item }) => (
                                            <RecentSearchItem
                                                item={item}
                                                onSelect={handleSearchSelect}
                                                onRemove={handleRemoveItemFromRecentSearches}
                                            />
                                        )}
                                        style={{ paddingBottom: 50 }} // this prevents clipping on bottom scroll
                                    />
                                ) : (
                                    <Text style={{ alignSelf: 'flex-start', fontFamily: 'inter', marginTop: 8 }}>
                                        Your recent searches will pop up here!
                                    </Text>
                                )
                            )}
                        </>
                    )}
                </View>
            )}
        </View >
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
        alignSelf: 'center',
        paddingRight: 40, // space for the icon
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
    },
    iconContainer: {
        position: 'absolute',
        zIndex: 1,
        right: 10,
        top: 1,
        padding: 10,

    },
    inputContainer: {}

})

