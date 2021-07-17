import { createReadStream, ReadStream, writeFile } from 'fs';
import path from 'path';
import readline from 'readline';
import yargs, { number } from 'yargs';

interface ArtistMap {
	[artist: string]: number[];
}

async function findRepeatingPairs() {
	const argv = await yargs.options({
		filePath: {
			type: 'string',
			alias: 'f',
			demandOption: true,
			description: 'relative path of the file containing the list of names',
		},
	}).argv;

	if (argv.filePath) {
		try {
			const fileStream: ReadStream = createReadStream(argv.filePath);
			const lineReader = readline.createInterface({
				input: fileStream,
				crlfDelay: Infinity,
			});
			let i = 0;
			let repeatingArtists: ArtistMap = {};
			for await (const line of lineReader) {
				const artists = line.split(',');
				for (const artist of artists) {
					if (repeatingArtists[artist]) {
						repeatingArtists[artist].push(i++);
					} else {
						repeatingArtists[artist] = [i++];
					}
				}
			}

			for (const artist in repeatingArtists) {
				if (repeatingArtists[artist].length < 50) {
					delete repeatingArtists[artist];
				}
			}

			let pairs: string[] = [];
			for (let artist1 in repeatingArtists) {
				for (let artist2 in repeatingArtists) {
					let temp = 0;
					if (artist1 === artist2) {
						continue;
					}
					for (const index in repeatingArtists[artist1]) {
						if (index in repeatingArtists[artist2]) {
							temp += 1;
						}
					}
					if (temp >= 50) {
						const pair = `${artist1},${artist2}`;
						if (pair in pairs) {
							continue;
						} else {
							pairs.push(pair);
							console.log(pair);
						}
					}
				}
			}

			writeFile(
				path.join(__dirname, 'Artist_lists_small_results.txt'),
				pairs.join('\n'),
				(err) => {
					if (err) {
						console.log(err);
					}
				}
			);
		} catch (err) {
			console.log(err);
		}
	}
}

findRepeatingPairs();
