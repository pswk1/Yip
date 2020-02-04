//5b9c13f9e30c6d6bcd91ac54f9a8bf91

//"user-key: 5b9c13f9e30c6d6bcd91ac54f9a8bf91" "https://developers.zomato.com/api/v2.1/cities?q=Turlock"

$.ajax({
    url: "https://developers.zomato.com/api/v2.1/search?entity_id=Los%20Angeles&entity_type=city&q=Taco",
    method: "GET",
    headers: {
        "user-key" : "5b9c13f9e30c6d6bcd91ac54f9a8bf91"
    }
}).then(function(response) {
    console.log(response);
})