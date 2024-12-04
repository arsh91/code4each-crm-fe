export const copyTextToClipboard = (text: string) => {
    const textElem = document.createElement('textarea')
    textElem.innerHTML = text
    document.body.appendChild(textElem)
    textElem.select()
    document.execCommand('copy')
    navigator.clipboard.writeText(textElem.value);
    document.body.removeChild(textElem)
}

export const capitalizeAndReplaceChar = (stringToChange: string, charToReplace: string) => {
    return stringToChange
        ? stringToChange
            .replace(new RegExp(`[${charToReplace}]`, 'g'), ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : null;
};

export const openLinkInNewTab = (url: string) => {
    return url
        ? window.open(url, "_blank")
        : null;
}
