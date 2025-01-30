import { useState, useEffect, useCallback, useContext } from 'react';
import { getFirestore, collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { userContext } from "../context/UserContext";
import { db } from '../../firebaseConfig';

const PAGE_SIZE = 12;

export function useListingsData(selectedOption) {
    const { user } = useContext(userContext)
    const [listings, setListings] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchListings = useCallback(async (refresh = false) => {
        if ((loadingMore || !hasMore) && !refresh) return;

        if (refresh) {
            setRefreshing(true);
            setIsLoading(true);
            setLastDoc(null);
            setHasMore(true);
        } else {
            setLoadingMore(true);
        }

        try {
            let q = query(
                collection(db, 'listings'),
                where('sold', '==', false),
                orderBy('createdAt', 'desc'),
                limit(PAGE_SIZE)
            );

            if (!refresh && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const querySnapshot = await getDocs(q);
            const listingsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).filter((post) => post.userId !== user.uid);

            const newLastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
            setHasMore(querySnapshot.docs.length === PAGE_SIZE);

            setListings((prev) => refresh ? listingsData : [...prev, ...listingsData]);
            setLastDoc(newLastDoc);
        } catch (error) {
            console.error("Error fetching listings:", error);
        } finally {
            setRefreshing(false);
            setLoadingMore(false);
            setIsLoading(false);
        }
    }, [user.uid, lastDoc, loadingMore, hasMore]);

    // initial fetch
    useEffect(() => {
        fetchListings(true);
    }, [selectedOption]);

    return {
        listings,
        isLoading,
        refreshing,
        loadingMore,
        onRefresh: () => fetchListings(true),
        onLoadMore: () => fetchListings(false)
    };
}