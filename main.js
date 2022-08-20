// Food times
const LUNCHTIME_WEEKDAY = "11:30am-1:30pm";
const DINNERTIME_WEEKDAY = "5:30pm-7:30pm";
const LUNCHTIME_SATURDAY = "11:30am-2:00pm";
const DINNERTIME_SATURDAY = "5:00pm-7:30pm";
const LUNCHTIME_SUNDAY = "11:30am-2:00pm";
const DINNERTIME_SUNDAY = "5:00pm-7:30pm";

// Munch and Breakfeast
const BREAKFEAST_WEEKDAY = "7:30am-10:00am"
const BREAKFEAST_WEEKEND = "8:00am-10:30am"
const MUNCH_WEEKDAY = "2:15pm-4:15pm"

// Lunch cutoff will be at 2pm
// Munch cutoff will be at 5pm
// Dinner cutoff will be at 8pm
const ENDLUNCH = 13;
const ENDMUNCH = 16;
const ENDDINNER = 19;

// JS added style sheets
let styleSheets = {};

// Turn on a diet tag
function tagFocus(tag){
    let rule = `${tag}{font-style: italic; background-color: yellow;}`
    // If the style doesn't exist, create it
    if(!styleSheets[tag]){
        let styleSheet = document.createElement("style");
        styleSheet.innerText = rule;
        document.head.appendChild(styleSheet);
        styleSheets[tag] = styleSheet;
    }else{
        styleSheets[tag].innerText = rule;
    }
}

// Turn off a diet tag
function disableTagFocus(tag){
    styleSheets[tag].innerText = `${tag}{}`;
}

// Trigger event to toggle a diet style
function dietEvent(button){
    let target = button.currentTarget;
    if(target.classList.contains("selected")){
        target.classList.remove("selected");
        disableTagFocus(target.id);

    }else{
        target.classList.add("selected");
        tagFocus(target.id);
    }
}

// Highlight toggle effect
function highlightClickEvent(element){
    let target = element.currentTarget;
    if(target.classList.contains("clicked")){
        target.classList.remove("clicked");
    }else{
        target.classList.add("clicked");
    }
}


// Time info
let now = new Date();
let isDinner = now.getHours() > ENDLUNCH;
// Adjust time such that sunday is last.
let timeValue = (now.getDay() * 2 + (isDinner ? 1 : 0) + 12) % 14; 

// Set the date
document.querySelector("#date").textContent = data[0].week;

// Add action listeners to buttons
let buttons = document.querySelector(".dietrow").children;
for(let i = 0; i < buttons.length; i++){
    buttons[i].addEventListener("click", e=>dietEvent(e));
}

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

    // Insert times for mealtimes
    // Use switch-case because this can change a lot
    let schedule = "";
    switch(timeIdx){
        case 0: // Sunday Lunch
            schedule = LUNCHTIME_SUNDAY;
            break;
        case 2: // Monday Lunch
        case 4:
        case 6:
        case 8:
        case 10: // Friday Lunch
            schedule = LUNCHTIME_WEEKDAY;
            break;
        case 12: // Saturday Lunch
            schedule = LUNCHTIME_SATURDAY;
            break;
        case 1:  // Sunday Dinner
            schedule = DINNERTIME_SUNDAY;
            break;
        case 3:  // Monday Lunch
        case 5:
        case 7:
        case 9:
        case 11: // Friday Dinner
            schedule = DINNERTIME_WEEKDAY;
            break;
        case 13: // Saturday Dinner
            schedule = DINNERTIME_SATURDAY;
            break;
        default:
            schedule = "???";
    }
    let mealtime = document.createElement("div");
    mealtime.textContent = schedule;
    mealtime.classList.add("subtext")
    serveries[0].appendChild(mealtime);
    
    // Update the menu for serveries
    for(let serveryIdx = 1; serveryIdx < serveries.length; serveryIdx++){
        // Clear original text content
        serveries[serveryIdx].textContent = "";

        // Get the menu for the servery at the specified time
        // [servery][mealtime][day][menu][food][type/food]
        let menu = null;
        if (timeIdx % 2 == 1){
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
        
        // Add the highlight event
        serveries[serveryIdx].addEventListener("click", e=>highlightClickEvent(e));
    }
}
