@include("layouts.header")
        <div class="container-fluid" style="background-color:#F5F6FA">
            <!--  Row 1 -->
            <div class="row">
                <div class="col">
                    <!-- Start Of Data Table -->
                    <div class="">
                        <table data-order="false" class="transactions-table data-table table table-bordered table-responsive bg-white text-nowrap w-100">
                            <thead class="bg-secondary">
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Amount</th>
                                    <th scope="col">Plan</th>
                                    <th scope="col">Date</th>
                                    <!--<th scope="col">Next Due Date</th>-->
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                            </tbody>
                        </table>
                    </div>
                    <!-- End Of Data Table -->
                </div>
            </div>
            <!--  End of Row 1 -->
        </div>
    </div>
</div>
<script src="{{asset('assets/libs/jquery/dist/jquery.min.js')}}"></script>
<script src="{{asset('assets/js/slim.min.js')}}"></script>
<script src="{{asset('assets/js/popper.min.js')}}"></script>
<script src="{{asset('assets/js/bootstrap.min.js')}}"></script>

<script src="{{asset('assets/libs/axios/axios.js')}}"></script>
<script src="{{asset('assets/plugins/datatables/js/jquery.dataTables.min.js')}}"></script>
<script src="{{asset('assets/plugins/datatables/js/dataTables.bootstrap4.min.js')}}"></script>
<script src="{{asset('assets/plugins/datatables/js/dataTables.responsive.min.js')}}"></script>
<script src="{{asset('assets/plugins/datatables/js/responsive.bootstrap4.min.js')}}"></script>
<script src="{{asset('assets/libs/apexcharts/dist/apexcharts.min.js')}}"></script>
<script src="{{asset('assets/libs/simplebar/dist/simplebar.js')}}"></script>
<script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
<script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
<script>
    let token = $("meta[name='csrf-token']").attr("content");
    let baseUrl = $("meta[name='base-url']").attr("content");

    function getRandomColor(){
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        //Convert the RGB components to headecimal format
        const colorHex = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
        return colorHex;
    }

    function getInitials(name){
        let fullname = name.split(" ");
        let initials = "";
        for(let i=0; i<fullname.length; i++){
            initials += fullname[i].charAt(0);
            if (i === 1) {
                break; // Break the loop after extracting the second initial
            }
        }
        return initials;
    }

    const statusClasses = {
        pending: "bg-warning",
        success: "bg-success",
        failed: "bg-danger"
    };

	$('.transactions-table').DataTable({
        data: @json($transactions),
        columns: [
            { 
                data: null,
                render: function(data, type, row){
                    let photo = data["user"]["profile"]["photo"];
                    if(photo != null){
                        return `<div class="user-card">
                            <div class="user-avatar sm">
                                <img src="${photo}" class="w-100 h-100">
                            </div>
                            <div class="user-name">
                                <h6 class="fw-semibold mb-1">${data["user"]["name"]}</h6>                        
                            </div>
                        </div> 
                        `;
                    }else{
                        return `<div class="user-card">
                            <div class="user-avatar sm" style="background-color:${getRandomColor()}">
                                <span>${getInitials(data["user"]["name"])}</span>
                            </div>
                            <div class="user-name">
                                <h6 class="fw-semibold mb-1">${data["user"]["name"]}</h6>                        
                            </div>
                        </div> `
                    }
                }
            },
            { data: "user.email" },
            { 
                data: null,
                render: function(data, type, row){
                    return "₦"+data["amount"].toLocaleString();
                }
            },
            { data: "plan.name"},
            { data: "created_at"},
            /*{ 
                data: null,
                render: function(data, type, row){
                    var expire_at = data["user"]["subscription_expire_at"];
                    return (expire_at !== null) ? expire_at : "";
                }
            },*/
            { 
                data: null,
                render: function(data, type, row){
                    var status = data["status"];
                    return '<span class="badge rounded-3 fw-semibold '+statusClasses[status]+'">'+status+'</span>'
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
        "pageLength": 50,
        "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
        //"page": 5,
        //"pagingType": "full_numbers",
        "createdRow": function(row, data, index){
            console.log("Column 10 Data:", data["status"]);
            if(data["status"] == "active"){
               //$(row).addClass("bg-primary");
            }/*else if (data["status"] == "failed") {
               $(row).addClass("bg-primary");
            }else{
               $(row).addClass("highlight-red");
            }*/
        }
	});
</script>
@include("layouts.footer")