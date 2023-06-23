/**
 *  rollup-plugin-fetch
 */
import { cacheAvailable, download, getIntegrity } from "./lib.js";

const defaultOptions = { targets: [], debug: false, showIntegrity: false };
/**
 * @example
 * fetch({
 *   targets: [
 *     {
 *       url: "https://example.org/foo.png",
 *       dest: "dist/assets/foo.png",
 *       // optional
 *       integrity: "sha384-xxxxxxx...",
 *     }
 *   ]
 * })
 */
export default (options = defaultOptions) => {
  const { targets, debug, showIntegrity } = options;

  return {
    name: 'fetch',
    async generateBundle() {
      for (const target of targets) {
        const { url, dest, integrity, fetchOptions } = target;
        if (await cacheAvailable(dest, integrity)) {
          debug && console.log(`[rollup-plugin-fetch] ${dest} cache available`);
        } else {
          await download(url, dest, fetchOptions, integrity);
          debug && console.log(`[rollup-plugin-fetch] ${url} downloaded to ${dest}`);
        }
        if (showIntegrity) {
          console.log(`[rollup-plugin-fetch] ${dest} integrity: ${await getIntegrity(dest)}`);
        }
      }
    }
  };
}
