let categories = [["Delivery", 1], ["Dine-out", 2], ["Nightlife", 3], ["Carching-up", 4], ["Takeaway", 5], ["Cafes", 6], ["Daily Menus", 7], ["Breakfast", 8], ["Lunch", 9], ["Dinner", 10], ["Pubs & Bars", 11], ["Pocket Friendly Delivery", 13], ["Clubs & Lounges", 14]];

let city = "";
let cityId = "";
let cuisineArr = [];
let establishmentArr = [];

$("#searchBtn1").click(function () {


    cuisineArr = [];
    establishmentArr = [];


    city = $("#searchCityId").val();

    $.ajax({
        url: `https://developers.zomato.com/api/v2.1/cities?q=${city}`,
        method: "GET",
        headers: {
            "user-key": "5b9c13f9e30c6d6bcd91ac54f9a8bf91"
        }
    }).then(function (response) {
        //Stores City id
        console.log(response);
        $("#parameters").removeClass("hide");
        cityId = response.location_suggestions[0].id;
        populateDropdown(categories, $("#category"));

        $.ajax({
            url: `https://developers.zomato.com/api/v2.1/establishments?city_id=${cityId}`,
            method: "GET",
            headers: {
                "user-key": "5b9c13f9e30c6d6bcd91ac54f9a8bf91"
            }
        }).then(function (response) {
            console.log(response);
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
            console.log(response);
            cuisineArr = makeCuisineArray(response);
            populateDropdown(cuisineArr, $("#cuisine"));
            //Returns results for city and cuisine search
        })
    })
})






$('#searchBtn2').on('click', function () {
    console.log("Hello");
    let userCategories = "";
    let categoriesId = "";
    userCategories = $('#experienceId').val();
    console.log(userCategories);

    let userCuisine = "";
    let cuisineId = "";
    userCuisine = $('#cuisineId').val();
    console.log(userCuisine);

    let establishment = "";
    let establishmentId = "";
    establishment = $('#establishmentId').val();
    console.log(establishment);

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
        console.log(response);
        let repitition = 6;
        if (response.restaurants.length < 6) {
            repitition = response.restaurants.length;
        }
        for (let i = 0; i < repitition; i++) {

            printInformation(response, i);
        }
    })
})

$('#clearBtn').click(function(){
    clearResults();
})

function clearResults() {
    $("#results").empty();
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
        target.prepend(currentOption);
    }
}

function printInformation(Obj, index) {
    let restaurant = Obj.restaurants[index].restaurant;
    let name = restaurant.name;
    let address = restaurant.location.address;
    let menuLink = restaurant.menu_url;
    let phoneNumber = restaurant.phone_numbers;

    let priceNumber = restaurant.price_range;
    let priceSign = "";
    for(let i = 0; i < priceNumber; i++) {
        priceSign += '$';
    }

    let rating = restaurant.user_rating.aggregate_rating;

    $('#results').append($(`
        <div class="col s12 m7">
            
            <div class="card horizontal">
                <div class="card-image">
                    <img src="${restaurant.thumb}">
                </div>
                <div class="card-stacked">
                    <div class="card-content">
                        <h3>${name}</h3>
                        <p>Rating: ${rating}</p>
                        <p>Price: ${priceSign}</p>
                        <p>${address}</p>
                        <p>${phoneNumber}</p>
                    </div>
                </div>
            </div>
        </div>
    `))
}

