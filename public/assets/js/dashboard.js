$(function () {
  const baseUrl = "http://172.20.10.2:8080/api/v1";

      // =====================================
      // Profit
      // =====================================
      var chart = {
      series: [
         { name: "Orders", data: [] },
         //{ name: "Revenues", data: [] }
      ],
      chart: {
         type: "line",
         height: 345,
         foreColor: "#adb0bb",
         fontFamily: 'inherit',
         offsetX: -15,
      },
      colors: ["#5D87FF", "#49BEFF"],
      grid: {
         borderColor: "rgba(0,0,0,0.1)",
         strokeDashArray: 3,
         xaxis: {
            lines: {
               show: true
            }
         }
      },
      xaxis: {
         type: "category",
         categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
         labels: {
           style: { cssClass: "grey--text lighten-2--text fill-color" },
         }
      },
      yaxis: {
         show: true,
         min: 0,
        // max: 400,
         tickAmount: 4,
         labels: {
            style: {
               cssClass: "grey--text lighten-2--text fill-color"
            }
         }
      },
      stroke: {
         show: true,
         curve: "smooth",
         width: 3,
         lineCap: "butt"
      }
   };

   var chart = new ApexCharts(document.querySelector("#chart"), chart);
   chart.render();

   axios.get(`${baseUrl}/admin/orders/chart-data`)
   .then((res) => {
      let details = res.data.results;
      chart.updateSeries([
         { name: "Orders", data: details.order },
         //{ name: "Revenues", data: details.revenue }
      ]);
   });


   // =====================================
   // Breakup
   // =====================================
   var breakup = {
      color: "#adb5bd",
      series: [38, 40, 25],
      labels: ["pending", "success", "failed"],
      chart: {
         width: 200,
         type: "donut",
         fontFamily: "Plus Jakarta Sans', sans-serif",
         foreColor: "#adb0bb"
      },
      plotOptions: {
         pie: {
            startAngle: 0,
            endAngle: 360,
            donut: {
               size: '75%'
            }
         }
      },
      stroke: { show: false },
      dataLabels: { enabled: false },
      legend: { show: false },
      colors: ["#5D87FF", "#ecf2ff", "#F9F9FD"],
      responsive: [
         {
            breakpoint: 991,
            options: {
               chart: {
                  width: 150
               }
            }
         }
      ],
      tooltip: {
         theme: "dark",
         fillSeriesColor: false
      }
   };
  var breakup = new ApexCharts(document.querySelector("#breakup"), breakup);
  breakup.render();



   // =====================================
   // Earning
   // =====================================
   var earning = {
      chart: {
         id: "sparkline3",
         type: "area",
         height: 60,
         sparkline: {
            enabled: true,
         },
         group: "sparklines",
         fontFamily: "Plus Jakarta Sans', sans-serif",
         foreColor: "#adb0bb",
      },
      series: [
         {
           name: "Earnings",
           color: "#49BEFF",
           data: [25, 66, 20, 40, 12, 58, 20, 66, 66],
         },
      ],
      stroke: {
         curve: "smooth",
         width: 2,
      },
      fill: {
         colors: ["#f3feff"],
         type: "solid",
         opacity: 0.05
      },
      markers: {
         size: 0,
      },
      tooltip: {
         theme: "dark",
         fixed: {
            enabled: true,
            position: "right"
         },
         x: {
           show: false,
         }
      }
   };
   var earning = new ApexCharts(document.querySelector("#earning"), earning);
   earning.render();

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
   axios.get(`${baseUrl}/admin/orders?q=recent`)
   .then((res) => {
      let data = res.data.results;
      data.forEach(function(order){
         $(".recent-orders").append(`
            <tr>
               <td class="border-bottom-0">
                  <h6 class="fw-semibold mb-0">#${order.order_no}</h6>
               </td>
               <td class="border-bottom-0">
                  <div class="user-card">
                     <div class="user-avatar sm ${colors[Math.floor(Math.random() * 4)]}">
                        <span>
                        ${order.user.firstname.charAt(0) + order.user.lastname.charAt(0)}
                        </span>
                     </div>
                     <div class="user-name">
                        <span class="tb-lead">${order.user.firstname +" "+ order.user.lastname}</span>
                     </div>
                  </div>                        
               </td>
               <td class="border-bottom-0">
                  <p class="mb-0 fw-normal">${modifyTime(order.createdAt)}</p>
               </td>
               <td class="border-bottom-0">
                  <span class="">${order.total} <span>NGN</span></span>
               </td>
               <td class="border-bottom-0">
                  <div class="d-flex align-items-center gap-2">
                     <span class="badge rounded-3 fw-semibold ${statusClasses[order.payment_status]}">${order.payment_status}</span>
                  </div>
               </td>
            </tr>  
         `);
    ``})
   })

   axios.get(`${baseUrl}/admin/products?q=top`)
   .then((res) => {
      let products = res.data.results;
      products.forEach(function(product){
         $(".cr-top-products").append(`
            <li class="item">
               <div class="thumb">
                  <img class="w-100" src="${product.product.images[0]["url"]}" alt="" />
               </div>
               <div class="info">
                  <div class="title">${product.product.name}</div>
                  <div class="price">$${product.product.price}</div>
               </div>
               <div class="total">
                  <div class="amount">$${product.product.price * Number(product.totalQuantity)}</div>
                  <div class="count">${product.totalQuantity} Sold</div>
               </div>
            </li>
         `);
      })
   })


   axios.get(`${baseUrl}/admin/store-statistics`)
   .then((res) => {
      let data = res.data.results;
      let elements = $(".cr-store-statistics .count");

      elements.each(function(key, index){
         switch(key){
            case(0):
               $(this).text(data.orders);
            break;
            case(1):
               $(this).text(data.customers);
            break;
            case(2):
               $(this).text(data.products);
            break;
            case(3):
               $(this).text(data.categories);
            break;
         }
      });
   })

})