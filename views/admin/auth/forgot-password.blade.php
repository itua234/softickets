<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <base href="{{url('')}}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <meta name="csrf-token" content="{{csrf_token()}}">

    <meta name="theme-color" content="" />
    <meta name="apple-mobile-web-app-status-bar-style" content="" />
    <title>Ziga Afrika Dashboard</title>
    <link rel="shortcut icon" type="image/png" href="{{asset('assets/images/logos/favicon.png')}}" />
    <link rel="stylesheet" href="https://cdn.lineicons.com/4.0/lineicons.css" />
    <link rel="stylesheet" href="{{asset('assets/libs/magnificpopup/magnific-popup.css')}}" />
    <link rel="stylesheet" href="{{asset('assets/libs/sweetalert2/sweetalert2.css')}}" />
    <link rel="stylesheet" href="{{asset('assets/css/bootstrap.min.css')}}" />
    <link rel="stylesheet" href="{{asset('assets/css/admin/main.css')}}" />
    <link rel="stylesheet" href="{{asset('assets/css/admin/dashboard.css')}}" />
    <?php date_default_timezone_set("Africa/Lagos"); ?>
  </head>
<body>
  <!--  Body Wrapper -->
  <div class="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
    data-sidebar-position="fixed" data-header-position="fixed">
    <div
      class="position-relative overflow-hidden radial-gradient min-vh-100 d-flex align-items-center justify-content-center">
      <div class="d-flex align-items-center justify-content-center w-100">
        <div class="row justify-content-center w-100">
          <div class="col-md-8 col-lg-6 col-xxl-3">
            <div class="card mb-0">
              <div class="card-body">
                <a href="{{url('/')}}" class="text-nowrap logo-img text-center d-block py-3 w-100">
                  <img src="{{asset('assets/images/logos/dark-logo.png')}}" width="180" alt="">
                </a>
                <p class="text-center">Reset Password.</p>
                <span class="message d-block" style="text-align:center"> </span>
                <form action="{{url('/reset-password')}}" method="POST" id="reset">
                  	@csrf
                    <div class="mb-3">
                      <label for="email" class="form-label">Email</label>
                      <input type="email" class="form-control" id="email" name="email">
                      <span class="error"></span>
                    </div>

                  	<button type="submit" 
            		      class="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2">Submit
					          </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script src="{{asset('assets/libs/jquery/dist/jquery.min.js')}}"></script>
  <script src="{{asset('assets/libs/axios/axios.js')}}"></script>
  <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
  <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
  <script src="{{asset('assets/libs/magnificpopup/magnific-popup.min.js')}}"></script>
  <script src="{{asset('assets/libs/sweetalert2/sweetalert2.all.js')}}"></script>
  <script>
      $('#reset').on("submit", function (event) {
        event.preventDefault();
        let btn = $(this).find("button[type='submit']");
        btn.html(`<img src="{{asset('assets/images/loader.gif')}}" style="width:20px;height:20px;">`);
        btn.attr("disabled", true);
        const form = event.target;
        const url = form.action;
        const inputs = {
        	email: $("#email").val()
        };

        $('.error').text('');
        $('.message').text('');
        const config = {
          	headers: {
            Accept: "application/json",
            	"Content-Type": "application/json",
              "X-CSRF-TOKEN": $("meta[name='csrf-token']").attr("content"),
              "X-Requested-With": "XMLHttpRequest"
          	}
        };
        axios.post(url, inputs, config)
        .then(function(response){
          	let message = response.data.message;
          	$(".message").css("color", "green");
          	$(".message").text(message);
          	//toast(message);
          	btn.attr("disabled", false);
          	btn.text("Submit");
        })
        .catch(function(error){
          	let errors = error.response.data.error;
          	if(errors.email){
            	$('.error').eq(0).text(errors.email);
          	}

            switch(error.response.status){
              case 400:
                $(".message").text(error.response.data.message)
              break;
              case 401:
                $(".message").text(error.response.data.message);
              break;
            }
            btn.attr("disabled", false);
            btn.text("Submit");
        });
      });

    function toast(message){
        const Toast = Swal.mixin({
			toast: true,
			position: 'center',
			showConfirmButton: false,
			timer: 3000,
			timerProgressBar: true,
          	didOpen: (toast) => {
              	toast.addEventListener('mouseenter', Swal.stopTimer)
              	toast.addEventListener('mouseleave', Swal.resumeTimer)
          	},
          	background: "#d8383e",
          	color: "#ffffff"
        });
          
        Toast.fire({
          	icon: 'success',
          	title: message
        });
    }
  </script>
</body>
</html>