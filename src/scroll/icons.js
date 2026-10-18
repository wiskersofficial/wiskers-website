export const ICONS = {
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 less:'<path d="m6 6 12 12M18 6 6 18"/>',
 chat:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l-4 3v-11A8.5 8.5 0 0 1 9.5 3H13a8 8 0 0 1 8 8.5Z" transform="translate(1 -1) scale(.92)"/><path d="M8 10h8M8 14h5"/>',
 friend:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>',
 tune:'<path d="M4 7h9m4 0h3M4 17h3m4 0h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
 explore:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
 sound:'<path d="m11 4-6 5H2v6h3l6 5ZM16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/>',
 mute:'<path d="m11 4-6 5H2v6h3l6 5ZM17 9l5 6m0-6-5 6"/>',
 arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 link:'<path d="m10 13 4-4M8 15l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 3 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 1)"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 bookmark:'<path d="M6 3h12v18l-6-4-6 4Z"/>',
 reset:'<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7"/>',
};
export const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.explore}</svg>`;
