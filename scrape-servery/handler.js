const puppeteer = require("puppeteer");
const { getChrome } = require('./chrome-script');
const dotenv = require("dotenv");
const { Octokit } = require("octokit");

class ServeryMenu{
    week = 0;
    lunch = [];
    dinner = [];
    name = "";

    constructor(name){
        let today = new Date();
        this.week = `${1 + today.getMonth()}/${today.getDate() - today.getDay()}`;
        this.name = name;
    }

    // Reads a ServeryMenu Object
    static async readServery(browser, name, link){
        let serveryMenu = new ServeryMenu(name);
        const page = await browser.newPage();
        await page.goto(link);
    
        // Parse the two different times of food
        let ftimes = await page.$$(".weekly-menu")
        for(let i = 0; i < ftimes.length; i++){
            // Parse the 7 different menus of each week
            let dtimes = await ftimes[i].$$("tbody");
            for(let i2 = 0; i2 < dtimes.length; i2++){
                // Parse menu
                let menu = [];
                let menuItems = await dtimes[i2].$$("td");
                for(let i3 = 0; i3 < menuItems.length; i3++){
                    // Parse an entry - the elements of an entry include the text and icons
                    let menuEntry = [];
                    let menuElem = await menuItems[i3].$$("div");
                    for(let i4 = 0; i4 < menuElem.length; i4++){
                        let item = await page.evaluate(elem => {
                            let elemClass = elem.getAttribute("class");
                            // Case: tag for food
                            if(elemClass.indexOf("icon") != -1){
                                switch(elemClass){
                                    case "icons icon-only icons-eggs": return "eggs";
                                    case "icons icon-only icons-fish": return "fish";
                                    case "icons icon-only icons-gluten": return "glut";
                                    case "icons icon-only icons-milk": return "milk";
                                    case "icons icon-only icons-peanuts": return "nuts";
                                    case "icons icon-only icons-shellfish": return "shlf";
                                    case "icons icon-only icons-soy": return "soy";
                                    case "icons icon-only icons-tree-nuts": return "tnut";
                                    case "icons icon-only icons-vegan": return "vega";
                                    case "icons icon-only icons-vegetarian": return "vegt";
                                    default: return "?";
                                }
                                return iconString(elem.getAttribute("class"));
                            }
                            // Case: normal entry
                            return elem.textContent;
                        }, menuElem[i4]);
                        menuEntry.push(item);
                    }
                    menu.push(menuEntry);
                }
                // Add a menu for a day+time to the list of all menus for the servery
                if(i == 0){
                    serveryMenu.addLunchMenu(menu);
                }else if(i == 1){
                    serveryMenu.addDinnerMenu(menu);
                }else{
                    console.log("ERROR: Invalid index");
                }
            }
        }
        return serveryMenu;
    }

    // Accepts ServeryMenu items
    static toData(list){
        return btoa(`data=${JSON.stringify(list)};`);
    }

    addLunchMenu(menu){
        this.lunch.push(menu);
    }

    addDinnerMenu(menu){
        this.dinner.push(menu);
    }
}

// Repository API
// https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents
const writeToGithub = async (content, owner, repo, path, auth_key) => {
  // Authenicate and get REST
  const octokit = new Octokit({
    auth: auth_key,
  });

  // Get the hash of the previous file
  // Not sure what will happen if the previous file does not exist
  let file_sha = null;
  await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: owner,
    repo: repo,
    path: path,
  }).then((res)=>{file_sha = res.data.sha;})

  // Overwrite the previous file with content
  // Logs the response
  await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: owner,
    repo: repo,
    path: path,
    sha: file_sha,
    message: 'A bot made this',
    content: content
  }).then((res)=>console.log(res)).catch((res)=>console.log(res))
}

module.exports.main = async () => {
  // Get the menu of each servery
  // Store them in serviesObj
  let serveries = [
    ["Seibel", "https://dining.rice.edu/seibel-servery/full-week-menu"], 
    ["South", "https://dining.rice.edu/south-servery/full-week-menu"],
    ["West", "https://dining.rice.edu/west-servery/full-week-menu"],
    ["Baker", "https://dining.rice.edu/baker-college-kitchen/full-week-menu"],
    ["North", "https://dining.rice.edu/north-servery/full-week-menu"]];
  let serveriesObj = [];
  const chrome = await getChrome();
  const browser = await puppeteer.connect({
    browserWSEndpoint: chrome.endpoint,
  });
  for(let servery of serveries){
    serveriesObj.push(await ServeryMenu.readServery(browser, servery[0], servery[1]));
    console.log(`${servery[0]} complete`)
  }
  browser.close();

  // Convert serviesObj into a javascript expression
  // Send the file to github in base64
  dotenv.config();
  writeToGithub(ServeryMenu.toData(serveriesObj), 
  'jryjng', 'rice-servery-viewer', 'dat.js', process.env.BOT_GITHUB_KEY);
}

// module.exports.main();