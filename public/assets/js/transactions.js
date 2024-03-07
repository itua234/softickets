$(function () {
    const baseUrl = "http://172.20.10.2:8080/api/v1";
 
    function fetchAllPayments(){
       $('.cr-payments').DataTable().destroy();
       $('.cr-payments').DataTable({
            ajax: {
                url: `${baseUrl}/admin/payments`,
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
                {data: "id"},
                {data: "channel"},
                {data: "currency"},
                {data: "reference"},
                { 
                    data: "amount",
                    render: function(data, type, row){
                        return data / 100;
                    }
                },
                { 
                    data: "requested_amount",
                    render: function(data, type, row){
                        return data / 100;
                    }
                },
                {data: "customer.email"},
                {data: "customer.phone"},
                {data: "status"},
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
   fetchAllPayments();
})