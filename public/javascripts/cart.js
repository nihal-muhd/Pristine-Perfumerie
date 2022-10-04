function changeQuantity(cartId, proId, userId, count) {
    let quantity = parseInt(document.getElementById(proId).value)
    console.log(quantity)
    count = parseInt(count)
    $.ajax({
        url: '/change-product-quantity',
        data: {
            user: userId,
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert("Product removed from cart")
                location.reload()
            } else {
                console.log(response.productTotal.proTotal)
                document.getElementById(proId).value = quantity + count;
                document.getElementById('proTotal' + proId).innerHTML = response.productTotal.proTotal
                document.getElementById('subTotal').innerHTML = response.total.total
            }
        }
    })
}

function productRemove(cartId, proId) {
    $.ajax({
        url: '/cart-delete-product/' + cartId + '/' + proId,
        method: 'get',
        success: (response) => {
            if (response.removeProduct) {
                alert('Do you want to remove this item from cart')
                location.reload()
            }
        }
    })
}

