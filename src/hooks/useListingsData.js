import {useState, useEffect, useCallback, useContext} from 'react';
import { getFirestore, collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import {userContext} from "../context/UserContext";

const PAGE_SIZE = 12;
const CACHE_DURATION = 300000; // 5 min in ms

export function useListingsData(selectedOption) {
    const { user } = useContext(userContext)

    const [listingsCache, setListingsCache] = useState({
        foryou: { items: [], lastDoc: null, hasMore: true },
        friends: { items: [], lastDoc: null, hasMore: true },
        sell: { items: [], lastDoc: null, hasMore: true }
    });
    const [lastFetchTime, setLastFetchTime] = useState({
        foryou: null,
        friends: null,
        sell: null
    });
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const db = getFirestore();

    const fetchListings = useCallback(async (refresh = false) => {
        const currentCache = listingsCache[selectedOption];

        // prevent un-needed fetches
        if (loadingMore && (!currentCache.hasMore || !currentCache.lastDoc)) {
            return;
        }

        if (refresh) {
            setRefreshing(true);
            setIsLoading(true);
        } else if (!refresh && currentCache.lastDoc) {
            setLoadingMore(true);
        }

        try {
            // base query
            let q = query(
                collection(db, 'listings'),
                where('sold', '==', false),
                orderBy('createdAt', 'desc'),
                limit(PAGE_SIZE)
            );

            // add pagination if loading more
            if (!refresh && currentCache.lastDoc) {
                q = query(q, startAfter(currentCache.lastDoc));
            }

            const querySnapshot = await getDocs(q);
            const listingsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).filter((post) => (post.userId !== user.uid));

            // update cache and then state
            const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            const hasMore = listingsData.length === PAGE_SIZE;

            const newCacheData = {
                items: refresh ? listingsData : [...currentCache.items, ...listingsData],
                lastDoc: newLastDoc,
                hasMore
            };

            setListingsCache(prev => ({
                ...prev,
                [selectedOption]: newCacheData
            }));
            setListings(newCacheData.items);
            setLastFetchTime(prev => ({
                ...prev,
                [selectedOption]: Date.now()
            }));
        } catch (error) {
            console.error('Error fetching listings:', error);
            throw error;
        } finally {
            setRefreshing(false);
            setLoadingMore(false);
            setIsLoading(false);
        }
    }, [selectedOption, listingsCache, loadingMore, db]);

    // initial fetch
    useEffect(() => {
        fetchListings(true);
    }, [selectedOption]);

    const handleRefresh = useCallback(() => {
        fetchListings(true);
    }, [fetchListings]);

    const handleLoadMore = useCallback(() => {
        if (!loadingMore && listingsCache[selectedOption].hasMore) {
            fetchListings(false);
        }
    }, [loadingMore, listingsCache, selectedOption, fetchListings]);

    return {
        listings,
        isLoading,
        refreshing,
        loadingMore,
        onRefresh: handleRefresh,
        onLoadMore: handleLoadMore
    };
}