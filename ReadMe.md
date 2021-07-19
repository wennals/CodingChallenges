# Artist Pair Matcher

## Installation
TypeScript and Nodejs are required to run this program:
- To download nodejs: 
    - visit: https://nodejs.org/en/

Use the npm package manager to install all depencies:
```bash
npm i 
```

## Usage
Run the following command to execute the program:
```bash
npm run start --  --filePath=filePath
```
where filePath is the relative path to the test file. 

## Results
The output .csv file will be returned at the root of the open directory

## Solution Summary
My solution has an efficiency of O(n^2) which is required to read the file contents and parse individual lines.
Since we are dealing with a 2D list, I needed to prevent any further nested loops to optimize my solution. So, I created the assemble potential
pairs function  to condense the data into a 1D list of potential matches that could later be processed. Otherwise I
would have had to use a loop of O(n^3) to loop over artists and their indexes at the same time to process if they occurred together at
least 50 times. Next I used O(n) loop for assembling artists pairs that occurred together at least 50 times via the find repeating pairs function.