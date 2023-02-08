const https = require('https');
const pako = require('pako');
const fs = require('fs');

async function main() {
    const url = 'https://drive.google.com/u/0/uc?id=1Cz1Un9p8Xn9IpEMMrg2kXSDt0dnjxc4z&export=download&confirm=t&uuid=9160dce5-0851-433e-8fdc-5c232692c375&at=ALgDtsy95Qj7ra_G4Hl9XoRcRLX0:1675830111808';

    https.get(url, res => {
      const fileStream = fs.createWriteStream('ted_corpus_subset.zip');
      res.pipe(fileStream);
    });
}

main();

