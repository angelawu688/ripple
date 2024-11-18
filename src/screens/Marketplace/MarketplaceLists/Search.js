import { useEffect, useRef, useState } from "react"
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, View } from "react-native"
import { Ionicons } from '@expo/vector-icons';
import ForYou from "./ForYou";



const testRecentSearches = [
    'bikes', 'cameras', 'desks', 'lamps',
]

const testSearchResults = [
    { listingID: 1, img: undefined, title: 'Sony Camera', price: 10, sold: false },
    { listingID: 2, img: undefined, title: 'Street Bike', price: 50, sold: false },
    { listingID: 3, img: undefined, title: 'Nintendo Switch', price: 80, sold: false },
    { listingID: 4, img: undefined, title: 'Airpod Pros', price: 50, sold: false },
    { listingID: 5, img: undefined, title: 'Catan Set', price: 10, sold: false },
]

const Search = ({ navigation }) => {
    // TODO add autocomplete API
    const [recentSearches, setRecentSearches] = useState([]);
    const [query, setQuery] = useState('')
    const [displayResults, setDisplayResults] = useState(false)
    const [searchResults, setSearchResults] = useState([])

    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // search input ref, will autoselect when we open
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);


    // if we change the query, no longer display results
    // honestly not sure if this is the best way to do this
    // useEffect(() => {
    //     setDisplayResults(false)
    // }, [query])


    useEffect(() => {
        // grab the recent searches
        setRecentSearches(testRecentSearches)
    }, [])


    const handleRemoveItemFromRecentSearches = (item) => {
        // backend logic here:
        // BACKEND LOGIC TO REMOVE IT ON BACKEND AS WELL
        setRecentSearches((prev) => prev.filter((search) => search !== item));
    }

    const handleSearchSelect = (item) => {
        setQuery(item)
        handleSearch()
    }


    const handleSearch = async () => {
        if (isLoading) { // prevent duplicate requests
            return
        }

        setIsLoading(true)
        try {
            // grab search results from the DB :)
            // + backend logic to add the recent search to the users recent searches
            setSearchResults(testSearchResults) // PLACEHOLDER
            setDisplayResults(true)
        } catch (e) {
            setErrorMessage(e.message)
            console.log(e)
        } finally {
            setIsLoading(false)
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

    const SearchResults = ({ query, results }) => (
        <View>
            {/* this is temp for debugging */}
            <Text style={styles.resultsHeader}>Results for "{query}"</Text>
            <FlatList
                data={results}
                keyExtractor={(item) => item.listingID.toString()}
                renderItem={({ item }) => (
                    <View style={styles.resultItem}>
                        <Text>{item.title}</Text>
                        <Text>${item.price}</Text>
                    </View>
                )}
            />
        </View>
    );


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
            {query.trim() !== '' && (
                <TouchableOpacity
                    hitSlop={{ bottom: 5, top: 5, right: 5, left: 5 }}
                    style={styles.clearButton}
                    onPress={() => {
                        setQuery('');
                        setDisplayResults(false); // reset to show recent searches
                    }}
                >
                    <Ionicons name="close-outline" size={24} color="#000" />
                </TouchableOpacity>
            )}
            {query && !displayResults && (
                <View style={styles.autocompleteContainer}>
                    {/*  */}
                    <Text>Autocomplete suggestions for "{query}" HERE</Text>
                </View>
            )}

            {isLoading && <ActivityIndicator size="large" color="#000" />}


            {displayResults ? (
                <ForYou listings={searchResults} navigation={navigation} />
                // <SearchResults query={query} results={searchResults} />
            ) : (
                <View style={{ width: '95%', alignSelf: 'center' }}>
                    {!query &&
                        (<View>
                            <Text style={styles.sectionHeader}>Recent Searches</Text>
                            <FlatList
                                data={recentSearches}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <RecentSearchItem
                                        item={item}
                                        onSelect={handleSearchSelect}
                                        onRemove={handleRemoveItemFromRecentSearches}
                                    />
                                )}
                            />
                        </View>)}
                </View>
            )}
        </View>)
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
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    resultsHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
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