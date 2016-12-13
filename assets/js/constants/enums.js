export const SortType = {
    PUBLICATION_DATE: 0,
    RELEVANCE: 1,
    ADDED_DATE: 2
}

export const SortDirection = {
    ASCENDING: 0,
    DESCENDING: 1
}

export function getSortTypeString(field) {
    let text = null;
    switch (field) {
        case SortType.PUBLICATION_DATE:
            text = "Publication Date";
            break;
        case SortType.RELEVANCE:
            text = "Relevance";
            break;
        case SortType.ADDED_DATE:
            text = "Date Added";
            break
        default:
            text = "Publication Date";
    }
    return text;
}

export function getSortDirectionString(direction) {
    return (direction == SortDirection.DESCENDING) ? '\u25bc' : '\u25b2';
}

