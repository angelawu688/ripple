// THESE ARE THE METHODS FOR CREATING AND EDITING LISTINGS

// taking the title and tags of a post, we generate the keywords
// all keywords are lowercase, delimited (by nonletters), and deduped
export const generateKeywords = (title, tags) => {
    const titleWords = title.toLowerCase().split(/[^a-zA-Z]+/).filter(word => word)

    const tagWords = tags.map(tag => tag.toLowerCase());

    return Array.from(new Set([...titleWords, ...tagWords]))
}


