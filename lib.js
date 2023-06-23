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

export async function checkIntegrity(dest, integrity) {
  const algorithm = integrity.split("-")[0];
  const actual = await getIntegrity(dest, algorithm);
  if (integrity !== actual) {
    throw new Error(`[rollup-plugin-fetch] integrity mismatch: dest=${dest} integrity=${integrity}, actual=${actual}`);
  }
}

export async function download(url, dest, fetchOptions = {}, integrity = undefined) {
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

  // integrity check
  if (integrity) {
    checkIntegrity(dest, integrity);
  }
}


export async function cacheAvailable(dest, integrity = undefined) {
  const exists = async (dest) => {
    try {
      const stats = await fs.promises.stat(dest);
      if (stats.isFile()) {
        return true;
      } else {
        throw new Error(`${dest} is not file.`);
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        return false;
      } else {
        throw error;
      }
    }
  };

  if (!(await exists(dest))) {
    // no cache exists
    return false;
  }

  if (!integrity) {
    // skip integrity check
    return true;
  }

  // integrity check
  try {
    checkIntegrity(dest, integrity);
  } catch(error) {
    console.error(error);
    return false;
  }
}
