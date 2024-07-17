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
                  <img src="{{asset('assets/images/logos/ziga-blue.png')}}" width="180" alt="">
                </a>
                <p class="text-center">Welcome Admin.</p>
                <span class="message d-block" style="text-align:center"> </span>
                <form action="{{url('/login')}}" method="POST" id="login">
                  @csrf
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email">
                    <span class="error"></span>
                  </div>
    
                  <div class="mb-4">
                    <label for="password" class="form-label">Password</label>
                    <div class="d-flex position-relative">
                        <input type="password" name="password" class="form-control" id="password">
                        <div class="d-flex align-items-center justify-content-center p-l-10 p-r-10 position-absolute h-100 px-2" style="top:0;right:0"><ion-icon class="show-hide" name="eye-outline"></ion-icon></div>
                    </div>
                    <span class="error"></span>
                  </div>

                  <div class="d-flex align-items-center justify-content-between mb-4">
                    <div class="form-check">
                      <input class="form-check-input primary" type="checkbox" value="" id="flexCheckChecked" checked>
                      <label class="form-check-label text-dark" for="flexCheckChecked">
                        Remember this Device
                      </label>
                    </div>
                    <a class="text-primary fw-bold" href="{{url('/forgot-password')}}">Forgot Password ?</a>
                  </div>
                  <button type="submit" 
                  class="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2">Sign In</button>
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
  <script src="{{asset('assets/libs/sweetalert2/sweetalert2.all.js')}}"></script>
  <script>
      $('#login').on("submit", function (event) {
        event.preventDefault();
        let btn = $(this).find("button[type='submit']");
        btn.html(`<img src="{{asset('assets/images/loader.gif')}}" style="width:20px;height:20px;">`);
        btn.attr("disabled", true);
        const form = event.target;
        const url = form.action;
        const inputs = {
          email: $("#email").val(),
          password: $("#password").val(),
          usertype: "admin"
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
          toast(message);
          btn.attr("disabled", false);
          btn.text("Sign In");
          // Add User Auth Bearer Token To Local Storage
          localStorage.setItem('adminToken', response.data.results.user.token);
          window.location.href = response.data.results.redirect;
        })
        .catch(function(error){
          let errors = error.response.data.error;
          if(errors.email){
            $('.error').eq(0).text(errors.email);
          }
          if(errors.password){
            $('.error').eq(1).text(errors.password);
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
          btn.text("Sign In");
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
  <script>
    $(document).ready(function () {
      $(".show-hide").click(function (event) {
          let icon = $(this);
          var input = $("#password");
          if(input.attr("type") === "password"){
              input.attr("type", "text");
              icon.attr("name", "eye-off-outline");
          }else{
              input.attr("type", "password");
              icon.attr("name", "eye-outline");
          }
      });
    });
  </script>
</body>
</html>