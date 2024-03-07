$(function () {
   const baseUrl = "http://172.20.10.2:8080/api/v1";

   function modifyTime (dateStr) {
      const date = new Date(dateStr);
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day}, ${month} ${year}`;
   };
   const statusClasses = {
      pending: "bg-primary",
      success: "bg-success",
      failed: "bg-danger"
   };
   const colors = [
      "bg-purple-dim",
      "bg-azure-dim",
      "bg-warning-dim",
      "bg-success-dim"
   ];
   function getRandomColor(){
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);

      //Convert the RGB components to headecimal format
      const colorHex = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
      return colorHex;
   }//style="background-color:${getRandomColor()}"

   function fetchAllOrders(){
      $('.cr-all-orders').DataTable().destroy();
      $('.cr-all-orders').DataTable({
         ajax: {
            url: `${baseUrl}/admin/orders?q=all`,
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
                  return `<h6 class="fw-semibold mb-0">${data["order_no"]}</h6>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  let user = data["user"];
                  return `<div class="user-card">
                     <div class="user-avatar sm ${colors[Math.floor(Math.random() * 4)]}">
                        <span>
                        ${user["firstname"].charAt(0) + user["lastname"].charAt(0)}
                        </span>
                     </div>
                     <div class="user-name">
                        <span class="tb-lead">${user["firstname"] +" "+ user["lastname"]}</span>
                     </div>
                  </div>  
                  <div>${user["email"]}</div>
                  `;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<p class="mb-0 fw-normal">${modifyTime(data["createdAt"])}</p>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<span class="">${data["subtotal"]} <span>NGN</span></span>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<span class="">${data["total"]} <span>NGN</span></span>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<span class="">${data["amount_paid"]} <span>NGN</span></span>`;
               }
            },
            {data: "reference"},
            {data: "payment_channel"},
            { 
               data: null,
               render: function(data, type, row){
                  let status = data["payment_status"];
                  return `<div class="d-flex align-items-center gap-2">
                     <span class="badge rounded-3 fw-semibold ${statusClasses[status]}">${status}</span>
                  </div>`;
               }
            },
            { 
               data: null,
               render: function(data, type, row){
                  return `<a class="view-order" data-id="${data['id']}">
                     <img src="/assets/images/icons/eye.svg" />
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
         },
         rowCallback: function(row, data, index){
            if(data[10] == "success"){
               $(row).addClass("bg-primary");
            }
         }
      });
   }
   fetchAllOrders();

   function getRandomImage(images){
      var length = images.length;
      let random = Math.floor(Math.random() * length);
      return images[random]["url"];
   }

   $(document).ready(function(){
      $(document).on("click", ".view-order", function(event){
         event.preventDefault();
         const id = $(this).data("id");
         axios.get(`${baseUrl}/admin/order/${id}`)
         .then((res) => {
            let data = res.data.results;
            let contents = data.contents;
            let customer = data.detail;
            $(".order-data tbody td .customer-name").text(customer.firstname+" "+ customer.lastname);
            $(".order-data tbody td .customer-email").text(customer.email);
            $(".order-data tbody td .customer-phone").text(customer.phone);
            $(".order-data tbody td .customer-street").text(customer.street);
            $(".order-data tbody td .customer-city").text(customer.city);
            $(".order-data tbody td .customer-state").text(customer.state);
            
            $(".order-contents").empty();
            contents.forEach(function(content){
               $(".order-contents").append(`
                  <div class="d-flex justify-content-between p-2">
                     <div class="">
                        <img src="${getRandomImage(content.product.images)}" style="width:60px;height:60px;">
                     </div>
                     <div class="">
                        <div><b>Price:</b> NGN ${content.price}</div>
                        <div><b>Qty:</b> ${content.quantity}</div>
                        <div><b>Total:</b> NGN ${content.price * content.quantity}</div>
                     </div>
                  </div>
               `);
            });
              
            $(".cr-modal").addClass("show");

            let audio = document.getElementById("myAudio");
            if(audio.paused || audio.ended){
               audio.play();
            }
         });
      });
   });


   $(document).ready(function(){
      $(document).on("click", ".cr-dropdown-toggle", function(event){
         var button = $(this);
         event.preventDefault();
         var drop = $(this).attr("id");
         var display = $('[aria-labelledby='+ drop +']').css("display");
         if(display === "none"){
            $('[aria-labelledby='+ drop +']').css('display', 'block');
         }else{
            $('[aria-labelledby='+ drop +']').css('display', 'none');
         }
      });
   });

   $(document).ready(function(){
      $(document).on("click", ".cr-modal-btn", function(event){
         event.preventDefault();
         $(".cr-modal").removeClass("show");
      });
   });


})