'use strict';
import { Octokit } from "octokit";
import { launch } from "puppeteer";
import dotenv from "dotenv";

class ServeryMenu{
    lunch = [];
    dinner = [];
    name = "";

    constructor(name){
        // Set the name
        this.name = name;
    }

    // Reads a ServeryMenu Object
    static async readServery(browser, name, link){
        let serveryMenu = new ServeryMenu(name);
        const page = await browser.newPage();
        await page.goto(link);
		
		// Click on "view week"
		// For some reason default element.click() doesnt work
		let wb = await page.$('button[href="#lw-tab-2"]');
		await page.evaluate(element => { element.click(); }, wb);
		
        // Menu divided into multiple containers
		// The index of the container determines which day it is
		// Here ftimes stores all of the different menus
		let ftimes = await page.$$("div#block-weeklylunch > .views-element-container");
		
		// Skip the first one 
        for(let i = 1; i < ftimes.length; i++){

            // Query children of ftimes for child menu items
            let menu = [];
            let menuItems = await ftimes[i].$$(".mitem");
            for(let i2 = 0; i2 < menuItems.length; i2++){

                let menuEntry = [];

                // The first entry will be the name (legacy)
				let named = await menuItems[i2].$(".mitem >.mname");
                menuEntry.push(await page.evaluate(elem => elem.textContent, named));

                // Subsequent entries will be diet tags
                let ttips = await menuItems[i2].$$(".mitem .tooltip");
                for(let i3 = 0; i3 < ttips.length; i3++){
                    let name = (await page.evaluate(elem => elem.getAttribute("data-content"), ttips[i3])).toLowerCase();
					switch (name){
						case "gluten": name = "glut";
						break;
						
						case "peanuts": name = "nuts";
						break;
						
						case "tree nuts": name = "tnut";
						break;
						
						case "vegan": name = "vega";
						break;
						
						case "vegetarian": name = "vegt";
						break;
						
						case "shellfish": name = "shlf";
						break;
					}
					menuEntry.push(name);
                }
                menu.push(menuEntry);
            }

            // Add a menu for a day+time to the list of all menus for the servery (legacy)
            if(i % 2 == 1){
                serveryMenu.addLunchMenu(menu);
            }else if(i % 2 == 0){
                serveryMenu.addDinnerMenu(menu);
            }
        }
		
        return serveryMenu;
    }

    // Accepts ServeryMenu items
    static toData(list){
        return btoa(`data=${JSON.stringify(list)};`);
    }

    // Get the header links present on the head
    static async getServeryHeaders(browser){
        const homepage = await browser.newPage();
        await homepage.goto("https://dining.rice.edu/");
        let allLinks = []
        let links = await homepage.$$(".alert a")
        for(let i = 0; i < links.length; i++){
            let item = await homepage.evaluate(elem => {
                return [elem.textContent, elem.getAttribute("href")]
            }, links[i]);
            allLinks.push(item)
        }
        return allLinks;
    }

    // Get the date that the menu will span
    static getDate(){
        const DAY = 24 * 60 * 60 * 1000;
        let today = new Date();
        
        // Get the last and next Monday
        let change_days = (today.getDay() + 6) % 7;
        let l_monday = new Date(today.getTime() - change_days * DAY);
        let n_sunday = new Date(l_monday.getTime() + 6 * DAY);
        return `${l_monday.getMonth() + 1}/${l_monday.getDate()}-${n_sunday.getMonth() + 1}/${n_sunday.getDate()}`;      
    }

    addLunchMenu(menu){
        this.lunch.push(menu);
    }

    addDinnerMenu(menu){
        this.dinner.push(menu);
    }
}

// Repository API
async function writeToGithub(content, owner, repo, path, auth_key){
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

export async function main(){
  // Get the menu of each servery
  // Store them in serviesObj
  let serveries = [
    ["Seibel", "https://dining.rice.edu/seibel-servery"], 
    ["South", "https://dining.rice.edu/south-servery"],
    ["West", "https://dining.rice.edu/west-servery"],
    ["Baker", "https://dining.rice.edu/baker-college-kitchen"],
    ["North", "https://dining.rice.edu/north-servery"]];

  // Populate this object  
  let serveryMaster = {
    date: undefined,
    serveries: undefined,
  };  

  // Populate date
  //serveryMaster.date = ServeryMenu.getDate();
  serveryMaster.date = new Date().toDateString();

  // Populate links
  const browser = await launch({});
  // serveryMaster.links = await ServeryMenu.getServeryHeaders(browser);

  // Populate serveries
  let serveriesObj = [];
  for(let servery of serveries){
    serveriesObj.push(await ServeryMenu.readServery(browser, servery[0], servery[1]));
    console.log(`${servery[0]} complete`)
  }
  serveryMaster.serveries = serveriesObj;

  

  browser.close();

  // Convert serviesObj into a javascript expression
  // Send the file to github in base64
  dotenv.config();
  writeToGithub(ServeryMenu.toData(serveryMaster),  process.env.USER_ID, 'rice-servery-viewer', 'dat.js', process.env.BOT_GITHUB_KEY);

}
await main();
