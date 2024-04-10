var currentuser;

window.onload = function () {
    init();

	// autocomplete 
	autocomplete(document.getElementById('search-box'), list_products);

	// Add keyword
	var tags = ["Iphone", "Ipad", "Airpod", "Apple Watch"];
	for (var t of tags) addTags(t, "index.html?search=" + t)

	currentuser = getCurrentUser();
	addProductToTable(currentuser);
}

// Add product table
function addProductToTable(user) {
	var table = document.getElementsByClassName('listProduct')[0];

	var s = `
		<tbody>
			<tr>
				<th>Number</th>
				<th>Products</th>
				<th>Prices</th>
				<th>Quantity</th>
				<th>Subtotal</th>
				<th>Time add to cart</th>
				<th>Delete</th>
			</tr>`;

	if (!user) {
		s += `
			<tr>
				<td colspan="7"> 
					<h1 class="notLogin">
						YOU ARE NOT LOGGED IN !!
					</h1> 
				</td>
			</tr>
		`;
		table.innerHTML = s;
		return;
	} else if (user.products.length == 0) {
		s += `
			<tr>
				<td colspan="7"> 
					<h1 class="emty">
						Cart is EMTY !!
					</h1> 
				</td>
			</tr>
		`;
		table.innerHTML = s;
		return;
	}

	var totalPrice = 0;
	for (var i = 0; i < user.products.length; i++) {
		var masp = user.products[i].ma;
		var soluongSp = user.products[i].soluong;
		var p = timKiemTheoMa(list_products, masp);
		var price = (p.promo.name == 'giareonline' ? p.promo.value : p.price);
		var thoigian = new Date(user.products[i].date).toLocaleString();
		var thanhtien = stringToNum(price) * soluongSp;

		s += `
			<tr>
				<td>` + (i + 1) + `</td>
				<td class="noPadding imgHide">
					<a target="_blank" href="productDetail.html?` + p.name.split(' ').join('-') + `" title="Views detail">
						` + p.name + `
						<img src="` + p.img + `">
					</a>
				</td>
				<td class="alignRight">` + price + ` ₫</td>
				<td class="soluong" >
					<button onclick="giamSoLuong('` + masp + `')"><i class="fa fa-minus"></i></button>
					<input size="1" onchange="capNhatSoLuongFromInput(this, '` + masp + `')" value=` + soluongSp + `>
					<button onclick="tangSoLuong('` + masp + `')"><i class="fa fa-plus"></i></button>
				</td>
				<td class="alignRight">` + numToString(thanhtien) + ` ₫</td>
				<td style="text-align: center" >` + thoigian + `</td>
				<td class="noPadding"> <i class="fa-solid fa-trash-can" onclick="xoaSanPhamTrongGioHang(` + i + `)"></i> </td>
			</tr>
		`;
		totalPrice += thanhtien;
	}

	s += `
			<tr style="font-weight:bold; text-align:center">
				<td colspan="4">TOTAL: </td>
				<td class="alignRight">` + numToString(totalPrice) + ` ₫</td>
				<td class="checkout" onclick="checkout()"> CHECKOUT </td>
				<td class="clearAll" onclick="clearAll()"> Clear </td>
			</tr>
		</tbody>
	`;

	table.innerHTML = s;
}

function xoaSanPhamTrongGioHang(i) {
	if (window.confirm('Confirm cancellation of purchase')) {
		currentuser.products.splice(i, 1);
		capNhatMoiThu();
	}
}

function checkout() {
	var c_user = getCurrentUser();
	if(c_user.off) {
        // alert('Your account is currently locked so you cannot make purchases!');
        addAlertBox('Your account has been locked by Yuki Store Admin.', '#aa0000', '#fff', 10000);
        return;
	}
	
	if (!currentuser.products.length) {
		addAlertBox('There are no Product requiring payment !!', '#ffb400', '#fff', 2000);
		return;
	}
	if (window.confirm('Checkout cart?')) {
		currentuser.donhang.push({
			"sp": currentuser.products,
			"ngaymua": new Date(),
			"tinhTrang": 'Pending'
		});
		currentuser.products = [];
		capNhatMoiThu();
		addAlertBox('The products have been placed on the Order and are awaiting processing.', '#17c671', '#fff', 4000);
		// Các sản phẩm đã được gửi vào đơn hàng và chờ xử lý
	}
}

function clearAll() {
    if (currentuser.products.length) {
        if (window.confirm('Are you sure you want to delete all products in the cart?!!')) {
            currentuser.products = [];
            capNhatMoiThu()
        }
    }
}


// Cập nhật số lượng lúc nhập số lượng vào input
function capNhatSoLuongFromInput(inp, masp) {
	var soLuongMoi = Number(inp.value);
	if (!soLuongMoi || soLuongMoi <= 0) soLuongMoi = 1;

	for (var p of currentuser.products) {
		if (p.ma == masp) {
			p.soluong = soLuongMoi;
		}
	}

	capNhatMoiThu();
}

function tangSoLuong(masp) {
	for (var p of currentuser.products) {
		if (p.ma == masp) {
			p.soluong++;
		}
	}

	capNhatMoiThu();
}

function giamSoLuong(masp) {
	for (var p of currentuser.products) {
		if (p.ma == masp) {
			if (p.soluong > 1) {
				p.soluong--;
			} else {
				return;
			}
		}
	}

	capNhatMoiThu();
}

function capNhatMoiThu() { 
	// Mọi thứ
	animateCartNumber();

	// cập nhật danh sách sản phẩm trong localstorage
	setCurrentUser(currentuser);
	updateListUser(currentuser);

	// cập nhật danh sách sản phẩm ở table
	addProductToTable(currentuser);

	// Cập nhật trên header
	capNhat_ThongTin_CurrentUser();
}
