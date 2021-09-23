/// <reference lib="DOM" />

export const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');