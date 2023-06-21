/**
 *  rollup-plugin-fetch
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { createHash } from "node:crypto";
import { URL } from "node:url";


async function getIntegrity(file, algorithm = "sha384") {
  const content = await fs.promises.readFile(file);

  const digest = createHash(algorithm).update(content).digest('base64');
  return `${algorithm}-${digest}`;
};


function download(url, options={}, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (response) => {
      response.pipe(fs.createWriteStream(dest));
      response.on("end", () => {
        if (response.statusCode === 200) {
          console.log(`[rollup-plugin-fetch] ${url} downloaded to ${dest}`);
          resolve();
        } else {
          reject(new Error(`Request failed (code: ${response.statusCode})`));
        }
      });
      response.on("error", reject);
    });
  });
}


async function cacheAvailable(dest, integrity = undefined) {
  try {
    const stats = await fs.promises.stat(dest);
    if (stats.isFile()) {
      if (integrity) {
        const algorithm = hash.split("-")[0];
        const i = await getIntegrity(dest, algorithm);
        if (integrity === i) {
          console.log(`[rollup-plugin-fetch] ${dest} cache available`);
          return true;
        } else {
          console.log("Integrity doesn't match");
          return false;
        }
      }
      console.log(`[rollup-plugin-fetch] ${dest} cache available`);
      return true;
    } else {
      throw new Error(`${dest} already exists`);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      throw error;
    }
  }
}


export default (options = { targets: []}) => {
  const { targets } = options;

  return {
    name: 'fetch',
    async generateBundle() {
      for (const target of targets) {
        if (!(await cacheAvailable(target.dest, target.integrity))) {
          await download(target.url, target.fetchOptions || {}, dest);
        }
      }
    }
  };
}
