let categories = [["Delivery", 1], ["Dine-out", 2], ["Nightlife", 3], ["Carching-up", 4], ["Takeaway", 5], ["Cafes", 6], ["Daily Menus", 7], ["Breakfast", 8], ["Lunch", 9], ["Dinner", 10], ["Pubs & Bars", 11], ["Pocket Friendly Delivery", 13], ["Clubs & Lounges", 14]];

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
            populateDropdown(categories, $("#category"));
    
            $.ajax({
                url: `https://developers.zomato.com/api/v2.1/establishments?city_id=${cityId}`,
                method: "GET",
                headers: {
                    "user-key": "5b9c13f9e30c6d6bcd91ac54f9a8bf91"
                }
            }).then(function (response) {
                establishmentArr = makeEstablishmentArray(response);
                populateDropdown(establishmentArr, $("#establishment"));
            })
            //This one funcions to find the cuisine id
            $.ajax({
                url: `https://developers.zomato.com/api/v2.1/cuisines?city_id=${cityId}`,
                method: "GET",
                headers: {
                    "user-key": "5b9c13f9e30c6d6bcd91ac54f9a8bf91"
                }
            }).then(function (response) {
                cuisineArr = makeCuisineArray(response);
                populateDropdown(cuisineArr, $("#cuisine"));
                //Returns results for city and cuisine search
            })
        })
    }
    
})

let userCuisine = "";
    

$('#searchBtn2').on('click', function () {
    let userCategories = "";
    let categoriesId = "";
    userCategories = $('#experienceId').val();

    userCuisine = "";
    let cuisineId = "";
    userCuisine = $('#cuisineId').val();

    let establishment = "";
    let establishmentId = "";
    establishment = $('#establishmentId').val();

    let queryURL = `https://developers.zomato.com/api/v2.1/search?entity_id=${cityId}&entity_type=city`;
    if (userCategories !== "") {
        categotiesId = getIdFromArr(categories, userCategories);
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

    $.ajax({
        url: queryURL,
        method: "GET",
        headers: {
            "user-key": "5b9c13f9e30c6d6bcd91ac54f9a8bf91"
        }
    }).then(function (response) {
        let repitition = 6;
        console.log(response);
        if(response.restaurants.length === 0) {

            $("#results").append($(`<h4>No results for a ${userCuisine} ${userCategories} ${establishment} in ${city}</h4>`));

        } else if (response.restaurants.length < 6) {
            repitition = response.restaurants.length;
            for (let i = 0; i < repitition; i++) {

                printInformation(response, i);
            }
        } else {
            for (let i = 0; i < repitition; i++) {

                printInformation(response, i);
            }
        }
    })
})

$('#clearBtn').click(function(){
    clearSearchAndResults();
})

$('#results').on('click', function(event) {
    if (event.target.matches('h6')) {
        let lat = event.target.getAttribute('lat');
        let lon = event.target.getAttribute('lon');
        let name = event.target.getAttribute('name');
        
        //insert script here for linking google maps API
    }
})

function clearSearchAndResults() {
    $("#results").empty();
    $("#cuisineId").val("");
    $("#establishmentId").val("");
    $("#experienceId").val("");
}

function getIdFromArr(Arr, choice) {
    for (let i = 0; i < Arr.length; i++) {
        if (Arr[i].includes(choice)) {
            return Arr[i][1];
        }
    }
}

function makeEstablishmentArray(Obj) {
    let retArr = [];

    for (let i = 0; i < Obj.establishments.length; i++) {
        retArr.push([Obj.establishments[i].establishment.name, Obj.establishments[i].establishment.id]);
    }
    return retArr;
}

function makeCuisineArray(Obj) {
    let retArr = [];

    for (let i = 0; i < Obj.cuisines.length; i++) {
        retArr.push([Obj.cuisines[i].cuisine.cuisine_name, Obj.cuisines[i].cuisine.cuisine_id]);
    }
    return retArr;
}

function findCuisineId(Obj, request) {
    let cuisine = Obj.cuisines;
    for (let i = 0; i < cuisine.length; i++) {
        if (cuisine[i].cuisine.cuisine_name === request) {
            return cuisine[i].cuisine.cuisine_id;
        }
    }
    return "";
}

function populateDropdown(Arr, target) {
    let currentOption;

    for (let i = 0; i < Arr.length; i++) {
        currentOption = $(`<option value="${Arr[i][0]}">`)
        target.append(currentOption);
    }
}

function printInformation(Obj, index) {
    let restaurant = Obj.restaurants[index].restaurant;

    let restaurantCuisine = restaurant.cuisines.split(',')[0];
    let image;
    if (restaurant.thumb !== "") {
        image = restaurant.thumb;

    } else {
        image = `assets/cuisine_food_img/${restaurantCuisine}.jpg`
    }

    let name = restaurant.name;
    let address = restaurant.location.address;
    let address1 = address.substr(0, address.length-6);
    let zipcode = address.substr(address.length-5);
    let menuLink = restaurant.menu_url;
    let phoneNumber = restaurant.phone_numbers;
    let priceNumber = restaurant.price_range;
    let url = restaurant.url;
    let lat = restaurant.location.latitude;
    let lon = restaurant.location.longitude;
    let priceSign = "";
    for(let i = 0; i < priceNumber; i++) {
        priceSign += '$';
    }

    let rating = restaurant.user_rating.aggregate_rating;
    if (rating === 0) {
      rating = "--";
    }

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
                    <h6 lat="${lat}" lon="${lon}" name="${name}">${address1}, ${state} ${zipcode}</h6>
                    <p>${phoneNumber}</p>
                </div>
            </div>
        </section>
       
    `))
}
