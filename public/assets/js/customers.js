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
 
    function fetchAllOrders(pageNumber){
       axios.get(`${baseUrl}/admin/users?page=${pageNumber}`)
       .then((res) => {
          let users = res.data.results;
          let pages = res.data.pages;
          $(".pagination-pages-count").text(pages);
          $(".pagination-form-select").html("");
          for(let i=1; i<=pages; i++){
             if(i == pageNumber){
                $(".pagination-form-select").append(`
                   <option value=${i} selected>${i}</option>
                `)
             }else{
                $(".pagination-form-select").append(`
                   <option value=${i}>${i}</option>
                `)
             }
          };
 
          $(".cr-all-orders tbody").empty();
          users.forEach(function(user){
             $(".cr-all-orders tbody").append(`
                <tr>
                    <td class="border-bottom-0">
                        <div class="user-card">
                            <div class="user-avatar sm ${colors[Math.floor(Math.random() * 4)]}">
                                <span>
                                ${user.firstname.charAt(0) + user.lastname.charAt(0)}
                                </span>
                            </div>
                            <div class="user-name">
                                <h6 class="fw-semibold mb-1">${user.firstname +" "+ user.lastname}</h6>
                                <span class="fw-normal tb-leadsss">${user.email}</span>                          
                            </div>
                        </div>                        
                    </td>
                    <td class="border-bottom-0">
                        <span class="">${user.phone} NGN</span>
                    </td>
                    <td class="border-bottom-0">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge rounded-3 fw-semibold ${statusClasses["success"]}">active</span>
                        </div>
                    </td>
                    <td class="border-bottom-0 edit-product-item">
                        <a class="view-order" data-id="${user.id}">
                            <img src="/assets/images/icons/eye.svg" />
                        </a>
                    </td>
                </tr>  
             `);
          })
       });
    };
    fetchAllOrders(1);
 
    $(".pagination").on("click", ".page-link-item", function(event){
       event.preventDefault();
       const pageNumber = Number($(this).text());
       fetchAllOrders(pageNumber);
    });
 
    $(".pagination-form-select").change(function(event){
       const selectedValue = Number($(this).val());
       fetchAllOrders(selectedValue);
    });
 
    /*$(document).ready(function(){
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
             
             $(".order-contents tbody td .order-number").text(data.order_no);
             $(".order-contents tbody td .order-subtotal").text(data.subtotal);
             $(".order-contents tbody td .order-total").text(data.total);
             $(".order-contents tbody td .order-reference").text(data.reference);
             $(".order-contents tbody td .order-payment-channel").text(data.payment_channel);
             $(".order-contents tbody td .order-status").text(data.payment_status);
             $(".order-contents tbody td .order-amount-paid").text(data?.amount_paid + " NGN");
               
             $(".cr-modal").addClass("show");
          });
       });
    });
 
    $(document).ready(function(){
       $(document).on("click", ".cr-modal-btn", function(event){
          event.preventDefault();
          $(".cr-modal").removeClass("show");
       });
    });*/
 
    //Filter orders
    $(".search-select").change(function(event){
       const value = $(this).val();
       alert(value);
    });
 
 })