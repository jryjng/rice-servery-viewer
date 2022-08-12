// From dat.js contains data (array)
// Lunch ends at 2pm?
const DINNER = 14;

let now = new Date();
// Time priority
let isDinner = now.getHours() > DINNER;
let timeValue = now.getDay() * 2 + (isDinner ? 1 : 0); 

// TMP TESTING
// timeValue = 0;

// Set the date
document.querySelector("#date").textContent = data[0].week;

// Loop through the rows
let menus = document.querySelectorAll(".row-menu");
let parent = menus[0].parentNode;
for(let timeIdx = 0; timeIdx < menus.length; timeIdx++){
    let currentElem = menus[timeIdx];

    // Remove outdated schedules
    if (timeValue > timeIdx){
        parent.removeChild(currentElem);
        continue;
    }

    // Update the current row
    let serveries = currentElem.children;
    for(let serveryIdx = 1; serveryIdx < serveries.length; serveryIdx++){
        // Clear original text content
        serveries[serveryIdx].textContent = "";

        // Get the menu for the servery at the specified time
        // [servery][mealtime][day][menu][food][type/food]
        let menu = null;
        if (isDinner){
            menu = data[serveryIdx - 1]["dinner"][Math.floor(timeIdx / 2)];
        }else{
            menu = data[serveryIdx - 1]["lunch"][Math.floor(timeIdx / 2)];
        }

        // Use another parent?
        let parent = document.createElement("ul");
        // let parent = serveries[serveryIdx];

        // Create an element from each menu
        // The first entry will contain text. Everything else is part of its class
        for(let foodIdx = 0; foodIdx < menu.length; foodIdx++){
            let elem = document.createElement("li");
            let food = menu[foodIdx];
            elem.textContent = food[0];
            for(let classIdx = 1; classIdx < food.length; classIdx++){
                elem.classList.add(food[classIdx]);
            }
            parent.appendChild(elem);
        }
        serveries[serveryIdx].appendChild(parent);
    }
}
