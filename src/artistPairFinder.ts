import { createReadStream, ReadStream, writeFile } from "fs";
import path from "path";
import readline from "readline";
import yargs from "yargs";

export interface ArtistMap {
  [artist: string]: number[];
}

export class ArtistPairFinder {
  constructor() {}
  
  async run() {
    const filePath: string = await this.getFilePath();
    if (filePath) {
      const repeatingArtists: ArtistMap = await this.parseFile(filePath);
      const filteredArtists = this.filterArtists(repeatingArtists);
      const tempPairs: Set<string> =
        this.assemblePotentialPairs(filteredArtists);
      const pairs = this.findRepeatingPairs(tempPairs, filteredArtists);
      writeFile(
        path.join(__dirname, "Artist_lists_small_results.txt"),
        pairs.join("\n"),
        (err) => {
          if (err) {
            console.log(
              `There was an error creating the file, please try again. ${err}`
            );
          }
        }
      );
    }
  }

  async getFilePath(): Promise<string> {
    const argv = await yargs.options({
      filePath: {
        type: "string",
        alias: "f",
        demandOption: true,
        description: "relative path of the file containing the list of names",
      },
    }).argv;
    return argv.filePath;
  }

  async parseFile(filePath: string): Promise<ArtistMap> {
    try {
      const fileStream: ReadStream = createReadStream(filePath);
      const lineReader = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });
      let i = 0;
      let repeatingArtists: ArtistMap = {};
      for await (const line of lineReader) {
        const artists = line.split(",");
        for (const artist of artists) {
          if (repeatingArtists[artist]) {
            repeatingArtists[artist].push(i++);
          } else {
            repeatingArtists[artist] = [i++];
          }
        }
      }
      return repeatingArtists;
    } catch (e) {
      console.log(`Error reading file Please try again, ${e}`);
      return {};
    }
  }

  filterArtists(repeatingArtists: ArtistMap) {
    for (const artist in repeatingArtists) {
      if (repeatingArtists[artist].length < 50) {
        delete repeatingArtists[artist];
      }
    }
    return repeatingArtists;
  }

  assemblePotentialPairs(repeatingArtists: ArtistMap): Set<string> {
    let tempPairs: Set<string> = new Set();
    for (let artist1 in repeatingArtists) {
      for (let artist2 in repeatingArtists) {
        if (artist1 === artist2) {
          continue;
        }
        const tempPair = `${artist1},${artist2}`;
        const tempReversePair = `${artist2},${artist1}`;
        if (tempPairs.has(tempPair)) {
          continue;
        }

        if (tempPairs.has(tempReversePair)) {
          continue;
        }
        tempPairs.add(tempPair);
      }
    }

    return tempPairs;
  }

  findRepeatingPairs(
    tempPairs: Set<string>,
    repeatingArtists: ArtistMap
  ): string[] {
    let finalPairs: string[] = [];
    tempPairs.forEach((pair: string) => {
      const artists = pair.split(",");
      const artist1 = artists[0];
      const artist2 = artists[1];
      let timesAppeardTogether = 0;
      for (const index in repeatingArtists[artist1]) {
        if (index in repeatingArtists[artist2]) {
          timesAppeardTogether += 1;
        }
      }

      if ((timesAppeardTogether = 50)) {
        const pair = `${artist1},${artist2}`;
        finalPairs.push(pair);
        return;
      }
    });
    return finalPairs;
  }
}
