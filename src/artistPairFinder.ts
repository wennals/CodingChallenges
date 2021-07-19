// Solution Summary
//
// The solution below has an efficiency of O(n^2) which is required to read the file contents and parse individual lines.
// Since we are dealing with a 2D list, I needed to prevent any further nested loops to optimize my solution. So, I created the assemble potential
// pairs function  to condense the data into a 1D list of potential matches that could later be processed. Otherwise I
// would have had to use a loop of O(n^3) to loop over artists and their indexes at the same time to process if they occurred together at
// least 50 times. Next I used O(n) loop for assembling artists pairs that occurred together at least 50 times via the find repeating pairs function.

import { createReadStream, ReadStream, writeFile } from 'fs';
import readline from 'readline';
import yargs from 'yargs';

export interface ArtistMap {
	[artist: string]: number[];
}

export class ArtistPairFinder {
	constructor() {}

	// Execute the program and return the results as a file
	async run() {
		const filePath: string | null = await this.getFilePath();
		if (filePath) {
			const repeatingArtists: ArtistMap = await this.parseFile(filePath);
			const tempPairs: Set<string> =
				this.assemblePotentialPairs(repeatingArtists);
			const pairs: string[] = this.findRepeatingPairs(
				tempPairs,
				repeatingArtists
			);
			this.createOutputFile(pairs);
		} else {
			console.log('Please enter a valid file path and try again.');
		}
	}

	// Extracts the filepath from the command line input
	async getFilePath(): Promise<string | null> {
		try {
			const argv = await yargs.options({
				filePath: {
					type: 'string',
					alias: 'f',
					demandOption: true,
					description: 'relative path of the file containing the list of names',
				},
			}).argv;
			return argv.filePath;
		} catch (err) {
			console.log(`There was an error parsing arguments: ${err}`);
			return null;
		}
	}

	// Parses each line of the specified file.
	// Then map each artist to a list of indexes indicating a list that contains the artist
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
				line.split(',').forEach((artist: string) => {
					if (repeatingArtists[artist]) {
						repeatingArtists[artist].push(i++);
					} else {
						repeatingArtists[artist] = [i++];
					}
				})
			}
			return repeatingArtists;
		} catch (e) {
			console.log(`Error reading file Please try again, ${e}`);
			return {};
		}
	}
	
	assemblePotentialPairs(repeatingArtists: ArtistMap): Set<string> {
		let tempPairs: Set<string> = new Set();
		for (let artist1 in repeatingArtists) {
			// Skip if the artist appears less than 50 times
			if (repeatingArtists[artist1].length < 50) {
				continue;
			}
			for (let artist2 in repeatingArtists) {
				if (artist1 === artist2) {
					continue;
				}

				if (repeatingArtists[artist2].length < 50) {
					continue;
				}
				const tempPair: string = `${artist1},${artist2}`;
				const tempReversePair: string = `${artist2},${artist1}`;
				if (tempPairs.has(tempPair)) {
					continue;
				}
				// Check for the reverse order to prevent duplicates
				if (tempPairs.has(tempReversePair)) {
					continue;
				}
				tempPairs.add(tempPair);
			}
		}

		return tempPairs;
	}

	// Returns a list of pairs that appear together at least 50 times.
	findRepeatingPairs(
		tempPairs: Set<string>,
		repeatingArtists: ArtistMap
	): string[] {
		let finalPairs: string[] = [];
		tempPairs.forEach((pair: string) => {
			const artists: string[] = pair.split(',');
			const artist1: string = artists[0];
			const artist2: string = artists[1];
			let count: number = 0;
			for (const index in repeatingArtists[artist1]) {
				if (index in repeatingArtists[artist2]) {
					count += 1;
				}
				if (count === 50) {
					const pair: string = `${artist1},${artist2}`;
					finalPairs.push(pair);
					return;
				}
			}
		});
		return finalPairs;
	}

	createOutputFile(pairs: string[]) {
		try {
			writeFile('results.csv', pairs.join('\n'), (err) => {
				if (err) {
					console.log(
						`There was an error creating the file, please try again. ${err}`
					);
				}
			});
		} catch (err) {
			console.log(err);
		}
	}
}
