//These are the categories and their respective Zomato ID's
//This allows us to translate the user's preference to the 
//corresponding Zomato search ID
let categories = [["Delivery", 1], ["Dine-out", 2], ["Nightlife", 3], ["Catching-up", 4], ["Takeaway", 5], ["Cafes", 6], ["Daily Menus", 7], ["Breakfast", 8], ["Lunch", 9], ["Dinner", 10], ["Pubs & Bars", 11], ["Pocket Friendly Delivery", 13], ["Clubs & Lounges", 14]];

let city = "";
let state = "";
let cityId = "";
let cuisineArr = [];
let establishmentArr = [];

//Searches Zomato for the requested city and gets the city id. This id is then used to get the possible
//establishments and cuisines for the given city
$("#searchBtn1").click(function () {

    state = "";
    cuisineArr = [];
    establishmentArr = [];
    city = $("#searchCityId").val();

    if (city !== "") {
        $.ajax({
            url: `https://developers.zomato.com/api/v2.1/cities?q=${city}`,
            method: "GET",
            headers: {
                "user-key": "5b9c13f9e30c6d6bcd91ac54f9a8bf91"
            }
        }).then(function (response) {
            //Shows the user the input options for cuisine, establishment, and experience
            $("#parameters").removeClass("hide");
            cityId = response.location_suggestions[0].id;
            state = response.location_suggestions[0].state_code;

            //Fills the drop down input for user desired Experience with the values
            //from the array categories
            populateDropdown(categories, $("#category"));
    
            $.ajax({
                url: `https://developers.zomato.com/api/v2.1/establishments?city_id=${cityId}`,
                method: "GET",
                headers: {
                    "user-key": "5b9c13f9e30c6d6bcd91ac54f9a8bf91"
                }
            }).then(function (response) {

                //Creates array with a similiar structure as the array categores, but
                //made for the establishments found in the user entered city
                establishmentArr = makeEstablishmentArray(response);
                //Uses establishmentArr to populate the establishment drop down input
                populateDropdown(establishmentArr, $("#establishment"));
            })
            
            $.ajax({
                url: `https://developers.zomato.com/api/v2.1/cuisines?city_id=${cityId}`,
                method: "GET",
                headers: {
                    "user-key": "5b9c13f9e30c6d6bcd91ac54f9a8bf91"
                }
            }).then(function (response) {
                //Creates array of cuisine options found in the user entered city
                cuisineArr = makeCuisineArray(response);
                //Uses cuisineArr to populate the cuisine drop down input
                populateDropdown(cuisineArr, $("#cuisine"));
                
            })
        })
    }
    
})

let userCuisine = "";

//This is the final submit button. Once pressed the value from each input
//is stored. If the user entered a value then the associated zomato id is 
//used to build a final Zomato query to get the user's requested results.
$('#searchBtn2').on('click', function () {
    //Gets user's Experience
    let userCategories = "";
    let categoriesId = "";
    userCategories = $('#experienceId').val();

    //Gets user's Cuisine
    userCuisine = "";
    let cuisineId = "";
    userCuisine = $('#cuisineId').val();

    //Gets user's Establishment
    let establishment = "";
    let establishmentId = "";
    establishment = $('#establishmentId').val();

    //The base query for restaurants in a given city
    let queryURL = `https://developers.zomato.com/api/v2.1/search?entity_id=${cityId}&entity_type=city`;

    //Adds to base query if user input is present
    if (userCategories !== "") {
        categoriesId = getIdFromArr(categories, userCategories);
        queryURL += `&category=${categoriesId}`;
    }
    if (userCuisine !== "") {
        cuisineId = getIdFromArr(cuisineArr, userCuisine);
        queryURL += `&cuisines=${cuisineId}`;
    }
    if (establishment !== "") {
        establishmentId = getIdFromArr(establishmentArr, establishment);
        queryURL += `&establishment_type=${establishmentId}`;
    }

    //Makes call to Zomato for user request
    $.ajax({
        url: queryURL,
        method: "GET",
        headers: {
            "user-key": "5b9c13f9e30c6d6bcd91ac54f9a8bf91"
        }
    }).then(function (response) {
        //Defaults to six results
        let repitition = 6;
        
        //If there are no results then this error message is displayed
        if(response.restaurants.length === 0) {

            $("#results").append($(`<h4>No results for a ${userCuisine} ${userCategories} ${establishment} in ${city}</h4>`));

          //If there are fewer than six results only those results will be displayed
        } else if (response.restaurants.length < 6) {
            repitition = response.restaurants.length;
            for (let i = 0; i < repitition; i++) {

                printInformation(response, i);
            }
          //Displays 6 of the total results  
        } else {
            for (let i = 0; i < repitition; i++) {

                printInformation(response, i);
            }
        }
    })
})

//Clears all search results and text from inputs
$('#clearBtn').click(function(){
    clearSearchAndResults();
})

function clearSearchAndResults() {
    $("#results").empty();
    $("#cuisineId").val("");
    $("#establishmentId").val("");
    $("#experienceId").val("");
}

//Loops through arrays structured as
// let Arr = [["someString", 0],["someOther", 1],...,["someMore", 8]]
//Returns the number associated with the inputted choice string.
//Used to get zomato id from user input
function getIdFromArr(Arr, choice) {
    for (let i = 0; i < Arr.length; i++) {
        if (Arr[i].includes(choice)) {
            return Arr[i][1];
        }
    }
}

//Creates an array of estbalishments from the ajax call to Zomato
function makeEstablishmentArray(Obj) {
    let retArr = [];

    for (let i = 0; i < Obj.establishments.length; i++) {
        retArr.push([Obj.establishments[i].establishment.name, Obj.establishments[i].establishment.id]);
    }
    return retArr;
}

//Creates an array of cuisines from the ajax call to Zomato
function makeCuisineArray(Obj) {
    let retArr = [];

    for (let i = 0; i < Obj.cuisines.length; i++) {
        retArr.push([Obj.cuisines[i].cuisine.cuisine_name, Obj.cuisines[i].cuisine.cuisine_id]);
    }
    return retArr;
}

//This adds all to the text values of a given array to a
//specified div. Used to put the values from the cusisine, 
//establishment, and experience arrays to their respective 
//inputs
function populateDropdown(Arr, target) {
    let currentOption;

    for (let i = 0; i < Arr.length; i++) {
        currentOption = $(`<option value="${Arr[i][0]}">`)
        target.append(currentOption);
    }
}

//Reads information from final ajax call and displays information
function printInformation(Obj, index) {
    //Reference to current restaurant object
    let restaurant = Obj.restaurants[index].restaurant;

    //If Zomato has an image associated with the restaurant that is used, if
    //not then the cuisine type is used which corresponds to one of the many 
    //default images that we have in out assets folder
    let restaurantCuisine = restaurant.cuisines.split(',')[0];
    console.log(restaurantCuisine);
    restaurantCuisine = restaurantCuisine.replace(" ", "_");
    console.log(restaurantCuisine);
    
    let image;
    if (restaurant.thumb !== "") {
        image = restaurant.thumb;

    } else {
        image = `assets/cuisine_food_img/${restaurantCuisine}.jpg`;
        console.log(image);
    }

    //These store the value of all the information that we chose to display
    let name = restaurant.name;
    let address = restaurant.location.address;
    let address1 = address.substr(0, address.length-6);
    let zipcode = address.substr(address.length-5);
    let priceNumber = restaurant.price_range;
    let url = restaurant.url;
    let lat = restaurant.location.latitude;
    let lon = restaurant.location.longitude;
    let phoneNumber = restaurant.phone_numbers;
    //This formats the phone number to be used in the href=tel:
    let dialNumber = parseInt(phoneNumber.replace(/[^0-9]/g,''), 10);

    //Converts price score into dollar signs
    let priceSign = "";
    for(let i = 0; i < priceNumber; i++) {
        priceSign += '$';
    }

    //If user rating is not included on Zomato it is displayed as 0
    //We chose to represent this instead as -- to show that it has not 
    //been rated.
    let rating = restaurant.user_rating.aggregate_rating;
    if (rating === 0) {
      rating = "--";
    }

    //Formats all information into html and adds to the results div.
    $('#results').prepend($(`
        
        <section class="card horizontal">
            <div class="card-image">
                <a href="${url}">
                    <img style="width: 200px" src="${image}">
                </a>
            </div>
            <div class="card-stacked">
                <div class="card-content" style="color: black">
                    <h3>${name}</h3>
                    <p>Rating: ${rating}</p>
                    <p>Price: ${priceSign}</p>
                    <h6 lat="${lat}" lon="${lon}" name="${name}" class="streetAddress">${address1}, ${state} ${zipcode}</h6>
                    <p><a href=tel:${dialNumber}>${phoneNumber}<a></p>
                </div>
            </div>
        </section>
       
    `))
}
