const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;
const downloadPath = path.join(__dirname, 'temp_downloads');

if (!fs.existsSync(downloadPath)) {
  fs.mkdirSync(downloadPath);
}

// Serve the whole directory
app.use(express.static(__dirname));

const server = app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadPath,
    });
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    
    console.log("Navigating to headless-compile.html...");
    await page.goto(`http://localhost:${port}/headless-compile.html`);
    
    console.log("Waiting for compilation to finish (this may take up to a minute)...");
    
    // Check periodically for the downloaded file
    const targetFilePath = path.join(downloadPath, 'targets.mind');
    
    let downloaded = false;
    for(let i=0; i<60; i++) {
        await new Promise(r => setTimeout(r, 1000));
        if (fs.existsSync(targetFilePath)) {
            // Ensure the file is not empty/still writing. Wait a second more.
            await new Promise(r => setTimeout(r, 1000));
            console.log("File downloaded successfully!");
            downloaded = true;
            break;
        }
    }
    
    if (downloaded) {
        const destPath = path.join(__dirname, 'assets', 'targets.mind');
        fs.copyFileSync(targetFilePath, destPath);
        console.log(`Successfully copied targets.mind to ${destPath}`);
        fs.unlinkSync(targetFilePath);
    } else {
        console.log("TIMEOUT: Failed to download targets.mind within 60 seconds.");
    }
    
    await browser.close();
  } catch(e) {
    console.error("Error during puppeteer execution:", e);
  } finally {
    server.close();
    process.exit(0);
  }
});
