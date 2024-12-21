import { useEffect, useRef, useState, useContext } from "react"
import { FlatList, Keyboard, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, View } from "react-native"
import { Ionicons } from '@expo/vector-icons';
import ForYou from "./ForYou";
import { collection, query as firestoreQuery, where, getDocs, getFirestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc, limit } from 'firebase/firestore';
import { userContext } from '../../../context/UserContext.js';
import { colors } from "../../../colors";
import ListingsList from '../../../components/ListingsList'
import { MotiView } from 'moti';
import ListingsListSkeletonLoaderFull from '../../../components/ListingsListSkeletonLoaderFull'
import { EmptyMessage, fetchRecentSearches, RecentSearchItem, RecentSearchSkeletonLoader, removeItemFromRecentSearchesFirebase, saveRecentSearchFirebase, searchByKeyword } from '../../../utils/search.js'
import LoadingSpinner from "../../../components/LoadingSpinner.js";
import UserSearch from "../../../components/Search/UserSearch.js";
import ListingSearch from "../../../components/Search/ListingSearch.js";

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

    // toggle and user search
    const [listingsSelected, setListingsSelected] = useState(true)
    const [loadingUserSearch, setLoadingUserSearch] = useState(false)
    const [userSearchResults, setUserSearchResults] = useState([])
    const [displayUserSearchResults, setDisplayUserSearchResults] = useState(false)
    const [userRecommendations, setUserRecommendations] = useState([])


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
        // pass directly, so that we can search
        setQuery(item)
        await handleSearch(item)
    }

    const handleSearch = async (query) => {
        try {
            // do the one thats selected. 
            // if uncomment the second part, it will do both and do the selecte one first
            if (listingsSelected) {
                await handleSearchListings(query)
                console.log('finished searching listings')
                // await handleSearchUsers(query)
            } else {

                await handleSearchUsers(query)
                // await handleSearchListings(query)
            }
        } catch (e) {
            console.error(e)
        } finally {
            // nothing to do 
        }
    }

    const handleSearchUsers = async (searchTerm) => {
        console.log('saerchTerm', searchTerm)
        if (!searchTerm || searchTerm.trim() === '') {
            return [];
        }
        setLoadingUserSearch(true)

        const usersRef = collection(db, 'users');
        const searchTermLower = searchTerm.toLowerCase();

        //   query on both name and email
        const nameQuery = firestoreQuery(
            usersRef,
            where('searchKeywords', 'array-contains', searchTermLower),
            limit(5)
        );

        const emailQuery = firestoreQuery(
            usersRef,
            where('email', '>=', searchTermLower),
            where('email', '<=', searchTermLower + '\uf8ff'),
            limit(5)
        );
        try {
            // exececute queries
            const [nameSnapshot, emailSnapshot] = await Promise.all([
                getDocs(nameQuery),
                getDocs(emailQuery)
            ]);


            const results = new Map();

            nameSnapshot.forEach((doc) => {
                results.set(doc.id, { id: doc.id, ...doc.data() });
            });

            emailSnapshot.forEach((doc) => {
                results.set(doc.id, { id: doc.id, ...doc.data() });
            });

            const combinedResults = Array.from(results.values())
            // .slice(0, 5); // commented out, this would be limiting after the fact
            console.log('combres', combinedResults)

            // return combinedResults;
            setUserSearchResults(combinedResults)
            setDisplayUserSearchResults(true)
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingUserSearch(false)
        }
    }


    const handleSearchListings = async (searchQuery, reset = true) => {
        if (searchQuery.trim() === '') { // prevent duplicate requests
            console.log('returned early')
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
            setSearchResults(prevResults => reset ? results : [...prevResults, ...results]);
            setLastVisible(newLastVisible);
            await saveRecentSearch(searchQuery);
        } catch (e) {
            setErrorMessage(e.message)
            console.log(e)
        } finally {
            // why? I forget
            setIsLoading(false)
        }
    }

    // not called 
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

            <View style={{ dispaly: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 10 }}>
                <TouchableOpacity onPress={() => setListingsSelected(!listingsSelected)}

                    style={{ width: '50%', alignItems: 'center', display: 'flex' }}>
                    <Text style={[{ marginBottom: 6, fontSize: 14 }, { fontWeight: listingsSelected ? '600' : '400' }]}>
                        Listings
                    </Text>
                    {listingsSelected && <View style={{ width: '100%', height: 1, backgroundColor: 'black' }} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setListingsSelected(!listingsSelected)}

                    style={{ width: '50%', alignItems: 'center', display: 'flex' }}>
                    <Text style={[{ marginBottom: 6, fontSize: 14 }, { fontWeight: !listingsSelected ? '600' : '400' }]}>
                        Users
                    </Text>
                    {!listingsSelected && <View style={{ width: '100%', height: 1, backgroundColor: 'black' }} />}
                </TouchableOpacity>
            </View>


            <View style={styles.iconContainer}>
                {!displayResults && query && (
                    <TouchableOpacity
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                        onPress={() => handleSearch(query)}>
                        <Ionicons name="search" size={20} color={colors.loginBlue} />
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
                        <Ionicons name='close-circle-outline' size={20} color={colors.accentGray} />
                    </TouchableOpacity>
                )}
            </View>


            {!listingsSelected && (
                <UserSearch navigation={navigation} query={query}
                    loadingUserSearch={loadingUserSearch}
                    userSearchResults={userSearchResults || []}
                    displayUserSearchResults={displayUserSearchResults}
                    userRecommendations={userRecommendations}
                />
            )}

            {listingsSelected && (
                <ListingSearch
                    isLoading={isLoading} query={query} searchResults={searchResults}
                    navigation={navigation} displayResults={displayResults} handleSearchSelect={handleSearchSelect} handleRemoveItemFromRecentSearches={handleRemoveItemFromRecentSearches}
                    loadingRecentSearches={loadingRecentSearches} recentSearches={recentSearches}
                />
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