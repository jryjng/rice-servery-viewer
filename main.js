// Food times
const LUNCHTIME_WEEKDAY = "11:30am- 01:30pm";
const DINNERTIME_WEEKDAY = "05:30pm- 08:00pm";
const LUNCHTIME_SATURDAY = "11:30am- 02:00pm";
const DINNERTIME_SATURDAY = "05:00pm- 08:00pm";
const LUNCHTIME_SUNDAY = "11:30am- 02:00pm";
const DINNERTIME_SUNDAY = "05:00pm- 08:00pm";

// Munch and Breakfeast
const BREAKFEAST_WEEKDAY = "7:30am-10:00am"
const BREAKFEAST_WEEKEND = "8:00am-10:30am"
const MUNCH_WEEKDAY = "2:15pm-4:15pm"

// Don't create entries for
IGNORE_SET = ["Cheese", "Steamed Rice", "Pepperoni", 
	      "Alfredo Sauce", "Jollof Rice", "Spanish Rice", 
	      "Tomatillo Rice", "Greek Lemon Rice", "Alfredo Sauce",
	      "Bacon Ranch", "Roasted Vegetables", "Ginger & Turmeric Rice", "Yellow Rice",
	      "Italian Sausage Supreme", "Chips", "Vegetable of The Day", "Basmati Rice", 
	      "Fiesta Rice", "Rice w/ Roasted Corn", "Baked Beans", "Black Beans", "Ranchero Beans", 
	      "Refried Beans", "Rice w/ Roasted Corn"]
PIZZA_RULE = true;



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

// Alert event
function alertEvent(element){
    let button = element.currentTarget;
    window.open(button.getAttribute("href"));
}

function scheduleToggleEvent(){
    let target = document.querySelector("#image-container");
    if(target.classList.contains("invisible")){
        target.classList.remove("invisible");
    }else{
        target.classList.add("invisible");
    }
}


// Time info
let now = new Date();
let isDinner = now.getHours() > ENDLUNCH;
// Adjust time such that sunday is last.
let timeValue = (now.getDay() * 2 + (isDinner ? 1 : 0) + 12) % 14; 

// Set the date
document.querySelector("#date").textContent = "Last updated " + data.date;


// If not updated on the last monday
let monday = new Date(now - (now.getDay()-1) * 8.64e+7);
if (now.getDay() == 0){
	monday = new Date(now - 6 * 8.64e+7);
}
monday.setHours(0, 0, 0, 0);


// Check if out of date
if (monday > new Date(data.date)){
	console.log(monday)
	document.querySelector("#date").textContent = "[OUTDATED] " + data.date;
	document.querySelector("#date").style.backgroundColor = "red";
	document.querySelector("#date").style.padding = "10px";
}




// Add action listeners to diet row buttons
let buttons = document.querySelector(".dietrow").children;
for(let i = 0; i < buttons.length; i++){
    buttons[i].addEventListener("click", e=>dietEvent(e));
}



// Create alert buttons
// UNUSED
/*
let alert = document.querySelector("#alert");
for(let i = 0; i < data.links.length; i++){
    let alertContent = data.links[i];
    let alertButton = document.createElement("button");
    alertButton.textContent = "Link: " + alertContent[0].replace(/\uFFFD/g, '');
    alertButton.setAttribute("href", alertContent[1])
    alertButton.addEventListener("click", e=>alertEvent(e));
    alert.appendChild(alertButton);
}
*/


// Set action event for schedule togger
// UNUSED
//let toggler = document.querySelector("#schedule-toggle");
//toggler.addEventListener("click", e=>scheduleToggleEvent());

// Loop through the rows
let menus = document.querySelectorAll(".row-menu");
let parent = menus[0].parentNode;
for(let timeIdx = 0; timeIdx < menus.length; timeIdx++){
    let currentElem = menus[timeIdx];

    // Skip if contains special attribute
    if (currentElem.classList.contains("ignore")){
        continue;
    }

    // Remove outdated schedules
    if (timeValue > timeIdx){
        //parent.removeChild(currentElem);
        currentElem.classList.add("hidden");
        continue;
    }

    // Update the current row
    let serveries = currentElem.children;


    // Insert times for mealtimes
    // Also set flags
    // Use switch-case because this can change a lot
    let schedule = "";
    switch(timeIdx){
        case 0:
        case 2:
        case 4:
        case 6:
        case 8:
            schedule = LUNCHTIME_WEEKDAY;
            break;
        case 1:
        case 3:
        case 5:
        case 7:
        case 9:
            schedule = DINNERTIME_WEEKDAY;
            break;
        case 10:
            schedule = LUNCHTIME_SATURDAY;
            break;
        case 11:
            schedule = DINNERTIME_SATURDAY;
            break;
        case 12:
            schedule = LUNCHTIME_SUNDAY;
            break;
        case 13:
            schedule = DINNERTIME_SUNDAY;
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
        // Skip if special attribute
        if(serveries[serveryIdx].classList.contains("ignore")){
            continue;
        }


        // Clear original text content
        serveries[serveryIdx].textContent = "";

        // Get the menu for the servery at the specified time
        // [servery][mealtime][day][menu][food][type/food]
        let menu = null;
        if (timeIdx % 2 == 1){
            menu = data.serveries[serveryIdx - 1]["dinner"][Math.floor(timeIdx / 2)];
        }else{
            menu = data.serveries[serveryIdx - 1]["lunch"][Math.floor(timeIdx / 2)];
        }
	menu.sort();

        // Use another parent?
        let parent = document.createElement("ul");

        // Create an element from each menu
        // The first entry will contain text. Everything else is part of its class
	let existing = new Set();
        for(let foodIdx = 0; foodIdx < menu.length; foodIdx++){
		// Skip if contains ignored
		let foodname = menu[foodIdx][0].trim()
		if (IGNORE_SET.includes(foodname)) {
			continue;
		}
		
		// 
		if (PIZZA_RULE && foodname.toLowerCase().includes("pizza")) {
			continue;
		}

		if (existing.has(foodname.trim())) {
			continue;
		}

		existing.add(foodname)
			
			
            let elem = document.createElement("li");
            let food = menu[foodIdx];
            elem.textContent = food[0].replace(new RegExp("with", "gi"), "w/").replace("�", "e")
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
