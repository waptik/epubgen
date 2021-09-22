/// <reference types="node" />
import { Content, Options } from '../dist/lib';
export * from '../dist/lib';

declare const epub: (options: Options, content: Content) => Promise<Blob>;
export default epub;
