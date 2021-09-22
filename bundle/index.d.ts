/// <reference types="node" />
import { Options } from '../dist/lib';
export * from '../dist/lib';

declare const epub: (options: Options) => Promise<Blob>;
export default epub;
