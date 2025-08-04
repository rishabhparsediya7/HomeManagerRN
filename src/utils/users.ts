export const createInitialsForImage = (name: string) => {
    if (!name) return 'NA';
    const words = name.split(' ');
    let initials = '';
    for (let i = 0; i < words.length; i++) {
        initials += words[i][0].toUpperCase();
    }
    return initials;
}