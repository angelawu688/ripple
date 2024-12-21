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

    // splits the search term so that we search on all results for all search terms 
    // (i.e. "blue shirt" --> query(blue) + query(shirt))
    const handleSearchUsers = async (searchTerm) => {
        if (!searchTerm || searchTerm.trim() === '') {
            return [];
        }
        setLoadingUserSearch(true)
        const usersRef = collection(db, 'users');
        // we split the query into search terms
        const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(term => term.length > 0);

        try {
            // create a query for each term
            const queries = searchTerms.map(term => {
                return Promise.all([
                    // names and keywords
                    getDocs(
                        firestoreQuery(
                            usersRef,
                            where('searchKeywords', 'array-contains', term),
                            limit(5)
                        )
                    ),
                    // email
                    getDocs(
                        firestoreQuery(
                            usersRef,
                            where('email', '>=', term),
                            where('email', '<=', term + '\uf8ff'),
                            limit(5)
                        )
                    )
                ]);
            });

            // wait for all of the queries
            const queryResults = await Promise.all(queries);

            const results = new Map();


            // go through all results to combine
            queryResults.forEach(([nameSnapshot, emailSnapshot]) => {
                // add the results from each query
                nameSnapshot.forEach((doc) => {
                    const data = { id: doc.id, ...doc.data() };
                    if (results.has(doc.id)) {
                        const existing = results.get(doc.id);
                        existing.matchScore = (existing.matchScore || 1) + 1;
                        results.set(doc.id, existing);
                    } else {
                        data.matchScore = 1;
                        results.set(doc.id, data);
                    }
                });

                // add results from email query
                emailSnapshot.forEach((doc) => {
                    const data = { id: doc.id, ...doc.data() };
                    if (results.has(doc.id)) {
                        const existing = results.get(doc.id);
                        existing.matchScore = (existing.matchScore || 1) + 1;
                        results.set(doc.id, existing);
                    } else {
                        data.matchScore = 1;
                        results.set(doc.id, data);
                    }
                });
            });

            //    convery to array, sort on how many appearances
            // i.e. for q = "Will Hunt", "Patrick William Hunt" would score 2, 
            //               "Caleb Hunt" or "Will Jones" would score 1
            const combinedResults = Array.from(results.values())
                .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

            setUserSearchResults(combinedResults);
            setDisplayUserSearchResults(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingUserSearch(false);
        }
    };

    // again, splits the query into search terms and performs a match search on items
    // i.e. "big bag" would return "Cotapoxi 42 Allpa Liter Bag" and "Huge bag"
    // also would include the tags
    const handleSearchListings = async (searchQuery, reset = true) => {
        if (searchQuery.trim() === '') {
            console.log('returned early');
            return;
        }

        if (reset) {
            setSearchResults([]);
            setLastVisible(null);
        }

        setIsLoading(true);
        setDisplayResults(true);
        Keyboard.dismiss();

        try {
            // split query into terms
            const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);

            // get results for each term. Searching by keyword 
            const allResults = await Promise.all(
                searchTerms.map(term => searchByKeyword(term, 20, reset ? null : lastVisible))
            );

            // map results to scores
            const resultsMap = new Map();

            // score all of the results
            allResults.forEach(({ results }) => {
                results.forEach(item => {
                    if (resultsMap.has(item.id)) {
                        const existing = resultsMap.get(item.id);
                        existing.matchScore = (existing.matchScore || 1) + 1;
                        resultsMap.set(item.id, existing);
                    } else {
                        item.matchScore = 1;
                        resultsMap.set(item.id, item);
                    }
                });
            });

            // sort by match score and combine
            const combinedResults = Array.from(resultsMap.values())
                .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

            // pagination, not really implemented yet but have support for it
            const newLastVisible = allResults[0]?.lastVisible;

            setSearchResults(prevResults => reset ? combinedResults : [...prevResults, ...combinedResults]);
            setLastVisible(newLastVisible);
            await saveRecentSearch(searchQuery);
        } catch (e) {
            setErrorMessage(e.message);
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };


    // not called. Future for pagination
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
                placeholder="Search"
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
                    <View style={{ width: '100%', height: 1, backgroundColor: !listingsSelected ? colors.loginGray : 'black' }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setListingsSelected(!listingsSelected)}

                    style={{ width: '50%', alignItems: 'center', display: 'flex' }}>
                    <Text style={[{ marginBottom: 6, fontSize: 14 }, { fontWeight: !listingsSelected ? '600' : '400' }]}>
                        Users
                    </Text>
                    <View style={{ width: '100%', height: 1, backgroundColor: listingsSelected ? colors.loginGray : 'black' }} />
                </TouchableOpacity>
            </View>


            <View style={styles.iconContainer}>
                {query && (
                    <>
                        {(!displayResults && listingsSelected) || (!displayUserSearchResults && !listingsSelected) ? (
                            <TouchableOpacity
                                onPress={() => handleSearch(query)}>
                                <Ionicons name="search" size={20} color={colors.loginBlue} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => {
                                    setQuery('')
                                    setSearchResults([])
                                    setUserSearchResults([])
                                    setDisplayResults(false)
                                    setDisplayUserSearchResults(false)
                                }}>
                                <Ionicons name='close-circle-outline' size={20} color={colors.accentGray} />
                            </TouchableOpacity>
                        )}
                    </>
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
        alignSelf: 'center',
        marginTop: 4
    },
    input: {
        height: 40,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderRadius: 15,
        marginBottom: 16,
        width: '95%',
        alignSelf: 'center',
        paddingRight: 40, // space for the icon
        borderWidth: 1,
        backgroundColor: colors.mediumGray,
        borderColor: colors.accentGray
    },
    // shadow: {
    //     shadowColor: colors.loginBlue,
    //     shadowOffset: {
    //         width: 0,
    //         height: 0,
    //     },
    //     shadowOpacity: 0.3,
    //     shadowRadius: 4,
    //     elevation: 8,
    // },
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