/**
 *  rollup-plugin-fetch
 */
import { cacheAvailable, download } from "./lib.js";

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
export default (options = { targets: []}) => {
  const { targets } = options;

  return {
    name: 'fetch',
    async generateBundle() {
      for (const target of targets) {
        if (!(await cacheAvailable(target.dest, target.integrity))) {
          await download(target.url, target.dest, target.fetchOptions);
        }
      }
    }
  };
}
