export function authorListToString(authors) {
    let authorString = '';
    for (let i=0; i<authors.length; i++) {
        authorString += authors[i]['name'];
        if (i < authors.length - 1) {
            authorString += ", ";
        }
    }
    let authorTitle = (authors.length > 1) ? "Authors" : "Author";
    return authorTitle + ": " + authorString;
}
