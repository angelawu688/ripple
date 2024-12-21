import { useEffect, useRef, useState, useContext } from "react"
import { FlatList, Keyboard, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, View } from "react-native"
import { Ionicons } from '@expo/vector-icons';
import ForYou from "./ForYou";
import { collection, query as firestoreQuery, where, getDocs, getFirestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { userContext } from '../../../context/UserContext.js';
import { colors } from "../../../colors";
import ListingsList from '../../../components/ListingsList'
import { MotiView } from 'moti';
import ListingsListSkeletonLoaderFull from '../../../components/ListingsListSkeletonLoaderFull'
import { EmptyMessage, fetchRecentSearches, RecentSearchItem, RecentSearchSkeletonLoader, removeItemFromRecentSearchesFirebase, saveRecentSearchFirebase, searchByKeyword } from '../../../utils/search.js'
import LoadingSpinner from "../../../components/LoadingSpinner.js";

const Search = ({ navigation }) => {
    const [recentSearches, setRecentSearches] = useState([]);
    const [query, setQuery] = useState('')
    const [displayResults, setDisplayResults] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [loadingRecentSearches, setLoadingRecentSearches] = useState(false)

    // for pagination
    const [lastVisible, setLastVisible] = useState(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useContext(userContext);

    const db = getFirestore();

    // search input ref, will autoselect when we open
    // be careful––if we end up putting recent searches in user context this will be an infinite loop
    const inputRef = useRef(null);

    useEffect(() => {
        const getRecentSearches = async () => {
            if (user) {
                setLoadingRecentSearches(true)
                try {
                    // TODO MAKE THIS ASYNC FUNCTION WORK
                    const recentSearches = await fetchRecentSearches(user.uid);
                    setRecentSearches(recentSearches || []);

                } catch (e) {
                    console.log(e)
                } finally {
                    setLoadingRecentSearches(false)
                }
            }
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
        getRecentSearches()
    }, [user?.uid]); // this will run less

    // saves a search to the user's recent searches
    // will optimistically update UI to be quick!
    const saveRecentSearch = async (searchQuery) => {
        if (!user) return;

        // optimimstic UI update
        // we can do this because this has a really high chance of working, and makes UI more responsive
        setRecentSearches((prevSearches) => {
            // Remove searchQuery if it exists, then add it to the front
            const updatedSearches = prevSearches.filter((term) => term.toLowerCase() !== searchQuery.toLowerCase());
            return [...updatedSearches, searchQuery]; // this seems backwards (it is) but we reverse the list down below :)
        });

        try {
            // backend update
            await saveRecentSearchFirebase(searchQuery, user.uid)
        } catch (e) {
            // rollback the UI update
            // look through the search terms and remove the one that is 
            setRecentSearches((prevSearches) =>
                prevSearches.filter((prevSearch) => prevSearch.toLowerCase() !== searchQuery.toLowerCase())
            );
            console.log(e)
        }
    };

    const handleRemoveItemFromRecentSearches = async (item) => {
        if (!user) return;
        // optimistic UI update
        setRecentSearches(prev => prev.filter(search => search !== item));
        try {
            await removeItemFromRecentSearchesFirebase(item, user.uid)
        } catch (e) {
            // rollback frontend update
            setRecentSearches((prevSearches) => {
                const updatedSearches = prevSearches.filter((term) => term !== item);
                return [...updatedSearches, item]; // this seems backwards (it is) but we reverse the list down below :)
            });
            console.error(e);
        }
    }

    const handleSearchSelect = async (item) => {
        setQuery(item)
        // pass directly, so that we can search. This is just how state works in react
        await handleSearch(item)
    }

    const handleSearch = async (searchQuery = query, reset = true) => {
        if (isLoading || searchQuery.trim() === '') { // prevent duplicate requests
            return
        }

        if (reset) {
            setSearchResults([]);
            setLastVisible(null); // Reset pagination
        }

        setIsLoading(true)
        setDisplayResults(true);
        Keyboard.dismiss()

        try {
            const { results, lastVisible: newLastVisible } = await searchByKeyword(searchQuery, 20, reset ? null : lastVisible);
            setSearchResults(prevResults => [...prevResults, ...results]);
            setLastVisible(newLastVisible);
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

    const fetchMoreResults = async () => {
        if (isFetchingMore || !lastVisible) {
            // initial fetch or we are currently fecthing more––prevent duplicate requests
            return
        }
        setIsFetchingMore(true)

        try {
            const { results, lastVisible: newLastVisible } = await searchByKeyword(query, 20, lastVisible);
            setSearchResults(prevResults => [...prevResults, ...results])
            setLastVisible(newLastVisible)
        } catch (e) {
            console.log(e)
        } finally {
            setIsFetchingMore(false)
        }
    }

    return (
        <View style={styles.container}>
            {/* top input part */}
            <TextInput
                ref={inputRef}
                value={query}
                onChangeText={(text) => {
                    setQuery(text);
                    setDisplayResults(false); // will hide results
                }}
                style={[styles.input, styles.shadow]}
                placeholder="What are you looking for?"
                placeholderTextColor={colors.accentGray}
                onSubmitEditing={() => handleSearch(query)}
                returnKeyType="search" // gives us the blue button on keyboard
                autoComplete="off" // i feel like these are really annoying as a user
                autoCorrect={true}
                autoCapitalize="none"
            />

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
                        <ListingsList
                            listings={searchResults}
                            navigation={navigation}

                        />
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
                                <RecentSearchSkeletonLoader />
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
})