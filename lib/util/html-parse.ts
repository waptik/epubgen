import { JSDOM } from 'jsdom';

export const parse = (html: string) => new JSDOM(html).window.document;