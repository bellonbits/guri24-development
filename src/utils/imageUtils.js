/**
 * Helper to get correct profile image URL
 * Handles both relative paths from backend and absolute URLs
 * @param {string} url - The avatar_url from the user object
 * @returns {string|null} - The full URL to the image or null
 */
export const getProfileImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    let baseUrl = import.meta.env.VITE_API_URL || 'https://api.guri24.com:8002';
    // Remove /api/v1 suffix if present to get root
    baseUrl = baseUrl.replace('/api/v1', '');
    // Remove trailing slash
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

    // Ensure url starts with / if it doesn't
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${cleanUrl}`;
};
