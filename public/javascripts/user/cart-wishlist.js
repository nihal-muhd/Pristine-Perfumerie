function addToCart(proId) {
  $.ajax({
    url: "/add-to-cart/" + proId,
    method: "get",
    cache: false,
    success: (response) => {
      if (response.status) {
        let count = $("#cart-count").text();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
        $("#cartRefresh").load(window.location.href + " #cartRefresh");
      } else {
        location.replace('/login')
      }
    },
  });
}

function addToWishList(proId) {
  $.ajax({
    url: '/addToWishlist/' + proId,
    method: 'get',
    success: (response) => {
      console.log(response)
      if(response.Exist){
        alert("Product already added to whislist")
      } else if (response.status) {
        Swal.fire(
          'Good job!',
          'Product added to whislist',
          'success'
        )
      }
    }
  });
}