export function wordCountToTag(wordCount) {
    let tag = "";
    if (wordCount === null) {
        // return empty string
    } else if (wordCount < 500) {
        tag = "small";
    } else if (wordCount <= 1600) {
        tag = "medium";
    } else {
        tag = "large";
    }
    return tag;
}

export function ariToGradeLevel(ari) {
    let gradeLevel = "";
    if (ari === null) {
        // return empty string
    } else if (ari <= 1) {
        gradeLevel = "kindergarten"
    } else if (ari <= 2) {
        gradeLevel = "first grade"
    } else if (ari <= 3) {
        gradeLevel = "second grade"
    } else if (ari <= 4) {
        gradeLevel = "third grade"
    } else if (ari <= 5) {
        gradeLevel = "fourth grade"
    } else if (ari <= 6) {
        gradeLevel = "fifth grade"
    } else if (ari <= 7) {
        gradeLevel = "sixth grade"
    } else if (ari <= 8) {
        gradeLevel = "seventh grade"
    } else if (ari <= 9) {
        gradeLevel = "eighth grade"
    } else if (ari <= 10) {
        gradeLevel = "ninth grade"
    } else if (ari <= 11) {
        gradeLevel = "tenth grade"
    } else if (ari <= 12) {
        gradeLevel = "eleventh grade"
    } else if (ari <= 13) {
        gradeLevel = "twelfth grade"
    } else {
        gradeLevel = "college"
    }
    return gradeLevel;
}

export function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
