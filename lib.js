import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { URL } from "node:url";


export async function getIntegrity(file, algorithm = "sha384") {
  const content = await fs.promises.readFile(file);

  const digest = createHash(algorithm).update(content).digest('base64');
  return `${algorithm}-${digest}`;
};


export async function download(url, dest, fetchOptions = {}) {
  const response = await new Promise((resolve, reject) => {
    https.get(url, fetchOptions, (response) => {
      if (response.statusCode === 200) {
        resolve(response);
      } else {
        reject(new Error(`Request failed (code: ${response.statusCode})`));
      }
    })
  });

  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await pipeline(
    response,
    fs.createWriteStream(dest)
  );
  console.log(`[rollup-plugin-fetch] ${url} downloaded to ${dest}`);
}


export async function cacheAvailable(dest, integrity = undefined) {
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
