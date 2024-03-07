$(function () {
    const baseUrl = "http://172.20.10.2:8080/api/v1";
 
    //fetch list of categories and then populate the select input field
    function fetchCategories(){
        axios.get(`${baseUrl}/category`)
        .then((res) => {
            let categories = res.data.results;
            $("#all-categories").empty();
            categories.forEach(function(category){
                $("#all-categories").append(`
                    <option value=${category["id"]}>${category["name"]}</option>
                `)
            });
        });
    };
    fetchCategories();


    function createCategory(url, formData){
        var btn = $("#create-category button[type='submit']");
        var btnSpan = $("#create-category button[type='submit'] span");
        const config = {
            headers: {
                Accept: "application/json",
                //"Content-Type": "multipart/form-data",
                //Authorization: `Bearer ${apiKey}`
            }
        };
        axios.post(url, formData, config)
        .then(function(response){
           let message = response.data.message;
           $(".message").text(message);
           fetchCategories();
           btn.attr("disabled", false);
           btnSpan.text("Add Category");
        })
        .catch(function(error){
           let errors = error.response.data.error;
            if(errors.name){
                document.getElementsByClassName('error')[0].innerHTML = errors.name;
            }
            btn.attr("disabled", false);
            btnSpan.text("Add Category");
        });
    }
  
     //Add new products to the store
    $('#create-category').on("submit", function (event) {
        event.preventDefault();
        var btn = $("#create-category button[type='submit']");
        btn.attr("disabled", true);
        $("#create-category button[type='submit'] span").text("Adding...");
        var form = event.target;
        var url = form.action;
        let formData = {
            name: $("#create-category input[name='name']").val()
        };
        
        $('.error').text('');
        $('.message').text('');
        //var apiKey = '<%= apiKey %>';
        createCategory(url, formData);
    });

 
})