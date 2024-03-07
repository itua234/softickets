$(function () {
   const baseUrl = "http://172.20.10.2:8080/api/v1";

   function getSerial(index, page){
      var sum = (page - 1) * 10 + index;
      return sum;
   }

   function getRandomImage(images){
      var length = images.length;
      let random = Math.floor(Math.random() * length);
      return images[random]["url"];
   }

   function fetchAllStoreProducts(){
      $('.cr-all-products').DataTable().destroy();
      $('.cr-all-products').DataTable({
         ajax: {
            url: `${baseUrl}/admin/products?q=all&page=1`,
            dataSrc: 'results'
         },
         columns: [
            { 
               data: null,
               orderable: false,
               searchable: false,
               render: function(data, type, row, meta){
                  let serial = meta.row + meta.settings._iDisplayStart + 1;
                  return serial;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  let images = data["images"];
                  return `<img style="width:50px;height:35px;border-radius:5px;margin-right:5px;" src="${getRandomImage(images)}" /><span class="fw-semibold">${data['name']}</span>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<span>${data['price']} <span>NGN</span></span>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<span>${data['stock']} </span>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<span>${data['category']['name']} </span>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<span>${data['sales']} </span>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<a class="view-product" data-id="${data['uuid']}">
                     <img src="/assets/images/icons/eye.svg" />
                  </a>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<a class="edit-product" data-id="${data['uuid']}">
                     <img src="/assets/images/icons/file-edit.svg" />
                  </a>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<a class="remove-product" data-id="${data['uuid']}" data-target="delete-product-modal">
                     <img src="/assets/images/icons/trash.svg" />
                  </a>`;
               }
            }
         ],
         columnDefs: [{
            targets: "datatable-nosort",
            orderable: false,
         }],
         "language": {
            "info": "_START_-_END_ of _TOTAL_ entries",
            searchPlaceholder: "Search",
            paginate: {
               next: '<ion-icon name="chevron-forward-outline"></ion-icon>',
               previous: '<ion-icon name="chevron-back-outline"></ion-icon>'  
            }
         }
      });
  }
  fetchAllStoreProducts();

   //open the sidebar and then populate the input fields with the product details to be updated
   $(document).ready(function(){
      $(document).on("click", ".edit-product", function(event){
         event.preventDefault();
         const id = $(this).data("id");
         axios.get(`${baseUrl}/product/${id}`)
         .then((res) => {
            let data = res.data.results;
            let images = data.images;
            var btn = $("#create-product button[type='submit']");
            btn.data("id", data.uuid);
            btn.data("action", "update");
            $(".cr-sidebar form input[name='name']").val(data.name);
            $(".cr-sidebar form input[name='price']").val(data.price);
            $(".cr-sidebar form input[name='stock']").val(data.stock);
            $(".cr-sidebar form input[name='brand']").val(data.brand);
            $(".cr-sidebar form select[name='category_id']").val(data.category.id);
            $(".cr-sidebar form textarea[name='description']").val(data.description);
            $(".cr-sidebar").css("right", "0px");
            images.forEach(function(image){
               $("#oldImagePreviewBox").append(`
                  <div style="position:relative;margin-right:25px;">
                     <img src=${image.url} style="height:60px;width:60px;">
                     <span id="removePreviousImage" data-id=${image.id}>
                     x
                     </span>
                  </div>
               `);
            })
         });
      });
   });

   
   $(document).ready(function(){
      $(document).on("click", ".view-product", function(event){
         event.preventDefault();
         const id = $(this).data("id");
         alert(id);
      });
   });

   $(document).ready(function(){
      //open the product delete modal
      $(document).on("click", ".remove-product", function(event){
         event.preventDefault();
         const modalId = $(this).data("target");
         const productId = $(this).data("id");
         $("#"+modalId+" .modal-footer button").data("id", productId);
         $("#"+modalId).addClass("show");
      });
      //close the product delete modal
      $(".close").on("click", function(event){
         event.preventDefault();
         var id = $(this).data("dismiss");
         $("#"+id).removeClass("show")
      });

      $("#delete-product-modal .modal-footer button").click(function(event){
         event.preventDefault();
         var btn = $(this);
         btn.text("Deleting....");
         let productId = btn.data("id");
         axios.delete(`${baseUrl}/product/${productId}`)
         .then((res) => {
            btn.attr("disabled", false);
            btn.text("Yes");
            fetchAllStoreProducts(1);
            btn.parent().parent().parent().removeClass("show");
         })
         .catch(function(error){
            //let errors = error.response.data.error;
            btn.attr("disabled", false);
            btn.text("Yes");
         });
      });
   });

   //fetch list of categories and then populate the select input field
   $(document).ready(function(){
      axios.get(`${baseUrl}/category`)
      .then((res) => {
         let categories = res.data.results;
         categories.forEach(function(category, index){
            $(".cr-sidebar form select[name='category_id']").append(`
               <option value=${category["id"]}>${category["name"]}</option>
            `)
         });
      });
   });

   //open the sidebar and then populate the input fields with the details of the new product to be added
   $(".cr-add-product-toggle").click(function(event){
      event.preventDefault();
      //var rightPosition = $(".cr-sidebar").css("right");
      $(".cr-sidebar").css("right", "0px");

      var btn = $("#create-product button[type='submit']");
      btn.data("id", "");
      btn.data("action", "create");
   });

   $(".cr-sidebar .close-icon").click(function(event){
      event.preventDefault();
      //var rightPosition = $(".cr-sidebar").css("right");
      $("#create-product")[0].reset();
      $('.error').text('');
      $('.message').text('');
      $(".cr-sidebar").css("right", "-290px");

      var btn = $("#create-product button[type='submit']");
      btn.data("id", "");
      btn.data("action", "");

      $("#imagePreviewBox").empty();
      $("#oldImagePreviewBox").empty();
      $("#totalImages span").text(0);
   });

   //Validate price and stock input field (allow only numbers)
   $(document).ready(function(){
      $(".cr-sidebar form input[name='price']").on("input", function(event){
         var inputValue = $(this).val();
         var pattern = /^[0-9]+$/;
         if(!pattern.test(inputValue)){
            $(this).val(inputValue.replace(/^[0-9]+$/, ""));
         }
      });
      $(".cr-sidebar form input[name='stock']").on("input", function(event){
         var inputValue = $(this).val();
         var pattern = /^[0-9]+$/;
         if(!pattern.test(inputValue)){
            $(this).val(inputValue.replace(/^[0-9]+$/, ""));
         }
      });
   });

   function createProduct(url, formData){
      var btn = $("#create-product button[type='submit']");
      var btnSpan = $("#create-product button[type='submit'] span");
      const config = {
         headers: {
           Accept: "application/json",
           "Content-Type": "multipart/form-data",
           //Authorization: `Bearer ${apiKey}`
         }
      };
      axios.post(url, formData, config)
      .then(function(response){
         let message = response.data.message;
         $(".message").text(message);
         fetchAllStoreProducts();
         btn.attr("disabled", false);
         btnSpan.text("Submit");
      })
      .catch(function(error){
         let errors = error.response.data.error;
         if(errors.name){
            document.getElementsByClassName('error')[0].innerHTML = errors.name;
         }
         if(errors.price){
            document.getElementsByClassName('error')[1].innerHTML = errors.price;
         }
         if(errors.stock){
            document.getElementsByClassName('error')[2].innerHTML = errors.stock;
         }
         if(errors.brand){
            document.getElementsByClassName('error')[3].innerHTML = errors.brand;
         }
         if(errors.category_id){
            document.getElementsByClassName('error')[4].innerHTML = errors.category_id;
         }
         if(errors.description){
            document.getElementsByClassName('error')[5].innerHTML = errors.description;
         }
         if(errors.images){
            document.getElementsByClassName('error')[6].innerHTML = errors.images;
         }
         btn.attr("disabled", false);
         btnSpan.text("Submit");
      });
   }

   //Add new products to the store
   $('#create-product').on("submit", function (event) {
      event.preventDefault();
      var btn = $("#create-product button[type='submit']");
      btn.attr("disabled", true);
      $("#create-product button[type='submit'] span").text("Adding...");
      var form = event.target;
      var url = form.action;
      var images = $("#images").prop("files");

      var formData = new FormData(form);
      
      $('.error').text('');
      $('.message').text('');
      //var apiKey = '<%= apiKey %>';
      if(btn.data("action") == "update"){
         url = url+"/"+btn.data("id");
      }
      createProduct(url, formData);
   });

   //Preview the images before uploading
   $("#images").change(function(event){
      $("#imagePreviewBox").empty();
      var inputs = event.target.files;
      var filesAmount = inputs.length;
      $("#totalImages span").text(inputs.length);
      
      for(let i=0; i<filesAmount; i++){
         var reader = new FileReader();
         //convert each image file to a string
         reader.readAsDataURL(inputs[i]);

         //fileReader will emit the load event when the dataURL is ready
         //Access the string using reader.result inside the callback function
         reader.onload = function(e){
            $("#imagePreviewBox").append(`
               <div style="position:relative;margin-right:25px;">
                  <img src=${e.target.result}  style="height:60px;width:60px;">
                  <span id="removePreview" data-name=${inputs[i].name}>
                  x
                  </span>
               </div>
            `);
         }
      }
   });

   //delete selected file from an array of file inputs
   $(document).on("click", "#removePreview", function(event){
      //event.preventDefault();
      const filteredFiles = new DataTransfer();
      const fileName = $(this).data("name");
      let files = $("#images").prop("files");
      
      for(var i=0; i<files.length; i++){
         if(files[i].name !== fileName){
            filteredFiles.items.add(files[i]); //here you exclude the file. thus removing it.
         }
      }

      //update the input with the new filelist;
      $("#images").prop("files", filteredFiles.files);  //Assign the updates list
      $("#totalImages span").text(filteredFiles.files.length);
      $(this).parent().remove();
   });

   //Delete product image
   $(document).on("click", "#removePreviousImage", function(event){
      //event.preventDefault();
      var btn = $(this);
      const imageId = $(this).data("id");
      axios.delete(`${baseUrl}/product/image/${imageId}`)
      .then((res) => {
         btn.parent().remove();
      })
      .catch(function(error){
         //let errors = error.response.data.error;
      });
   });

})