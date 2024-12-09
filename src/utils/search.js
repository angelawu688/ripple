import { collection, query, where, getDocs, limit, startAfter, getFirestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc, orderBy, } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

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