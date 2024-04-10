var nameProduct, maProduct, sanPhamHienTai;
// Tên sản phẩm trong trang này, 
// là biến toàn cục để có thể dùng ở bát cứ đâu trong trang
// không cần tính toán lấy tên from url nhiều lần

window.onload = function () {
    init();

    // Addtags (from khóa) vào khung Search
    var tags = ["Mac", "Iphone", "Airpods", "Ipad", "Watch"];
    for (var t of tags) addTags(t, "index.html?search=" + t, true);

    phanTich_URL_productDetail();

    // autocomplete cho khung tim kiem
    autocomplete(document.getElementById('search-box'), list_products);

    // Add gợi ý Products
    sanPhamHienTai && suggestion();
}

function khongTimThaySanPham() {
    document.getElementById('productNotFound').style.display = 'block';
    document.getElementsByClassName('productDetail')[0].style.display = 'none';
}

function phanTich_URL_productDetail() {
    nameProduct = window.location.href.split('?')[1];
    // lấy tên
    if (!nameProduct) return khongTimThaySanPham();

    // tách theo dấu '-' vào gắn lại bằng dấu ' ', code này giúp bỏ hết dấu '-' thay vào bằng khoảng trắng.
    // code này làm ngược lại so với lúc tạo href cho Products trong file classes.js
    nameProduct = nameProduct.split('-').join(' ');

    for (var p of list_products) {
        if (nameProduct == p.name) {
            maProduct = p.masp;
            break;
        }
    }

    sanPhamHienTai = timKiemTheoMa(list_products, maProduct);
    if (!sanPhamHienTai) return khongTimThaySanPham();

    var divChiTiet = document.getElementsByClassName('productDetail')[0];

    // Đổi title
    document.title = nameProduct + ' - Yuki Store';

    // Cập nhật tên h1
    var h1 = divChiTiet.getElementsByTagName('h1')[0];
    h1.innerHTML += nameProduct;

    // Cập nhật Star
    var rating = "";
    if (sanPhamHienTai.rateCount > 0) {
        for (var i = 1; i <= 5; i++) {
            if (i <= sanPhamHienTai.star) {
                rating += `<i class="fa fa-star"></i>`
            } else {
                rating += `<i class="fa fa-star-o"></i>`
            }
        }
        rating += `<span style="color:#a9a5a5"> ` + sanPhamHienTai.rateCount + ` rated</span>`;
    }
    divChiTiet.getElementsByClassName('rating')[0].innerHTML += rating;

    // Cập nhật giá + label khuyến mãi
    var price = divChiTiet.getElementsByClassName('area_price')[0];
    if (sanPhamHienTai.promo.name != 'giareonline') {
        price.innerHTML = `<strong>` + sanPhamHienTai.price + `₫</strong>`;
        price.innerHTML += new Promo(sanPhamHienTai.promo.name, sanPhamHienTai.promo.value).toWeb();
    } else {
        document.getElementsByClassName('ship')[0].style.display = '';
        // hiển thị 'giao hàng trong 1 giờ'
        price.innerHTML = `<strong>` + sanPhamHienTai.promo.value + `&#8363;</strong>
					        <span>` + sanPhamHienTai.price + `&#8363;</span>`;
    }

    // Cập nhật chi tiết khuyến mãi
    document.getElementById('detailPromo').innerHTML = getDetailPromo(sanPhamHienTai);

    // Cập nhật thông số
    var info = document.getElementsByClassName('info')[0];
    var s = addThongSo('Screen:', sanPhamHienTai.detail.screen);
    s += addThongSo('Operating system:', sanPhamHienTai.detail.os);
    s += addThongSo('Rear camera:', sanPhamHienTai.detail.camara);
    s += addThongSo('Front camera:', sanPhamHienTai.detail.camaraFront);
    s += addThongSo('CPU:', sanPhamHienTai.detail.cpu);
    s += addThongSo('RAM:', sanPhamHienTai.detail.ram);
    s += addThongSo('Internal memory:', sanPhamHienTai.detail.rom);
    s += addThongSo('Memory Stick:', sanPhamHienTai.detail.microUSB);
    s += addThongSo('Battery capacity:', sanPhamHienTai.detail.battery);
    info.innerHTML = s;

    // Cập nhật hình
    var hinh = divChiTiet.getElementsByClassName('picture')[0];
    hinh = hinh.getElementsByTagName('img')[0];
    hinh.src = sanPhamHienTai.img;
}
// Chi tiết khuyến mãi
function getDetailPromo(sp) {
    switch (sp.promo.name) {
        case 'tragop':
            var span = `<span style="font-weight: bold; color: #ff8f9c;"> ` + sp.promo.value + `% Interest Rate</span>`;
            return `Customers can buy products in installments with ` + span;

        case 'giamgia':
            var span = `<span style="font-weight: bold; color: #ff8f9c;">` + sp.promo.value + `₫</span>`;
            return `Customers will receive a discount of ` + span + ` when purchase directly at the YUKI STORE`;

        case 'moiramat':
            return `At YUKI STORE, customers will have the exclusive opportunity to test and purchase the latest products`;

        case 'giareonline':
            var del = stringToNum(sp.price) - stringToNum(sp.promo.value);
            var span = `<span style="font-weight: bold; color: #ff8f9c;">` + numToString(del) + `₫ </span>`;
            return `Products will be discounted ` + span + ` when purchased Online with a Visa card`;

        default:
            var span = `<span style="font-weight: bold; color: #ff8f9c;">The latest product from APPLE</span>`;
            return `Chance to win ` + span + ` when making installment payments`;
    }
}

function addThongSo(ten, giatri) {
    return `<li>
                <p>` + ten + `</p>
                <div>` + giatri + `</div>
            </li>`;
}


// Thêm sản phẩm vào các khung sản phẩm 
function addboxProduct(list_sanpham, tenKhung, color, ele) {
    // convert color to code
    var gradient = `background-image: linear-gradient(120deg, ` + color[0] + ` 0%, ` + color[1] + ` 50%, ` + color[0] + ` 100%);`
    var borderColor = `border-color: ` + color[0];
    var borderA = `	border-left: 2px solid ` + color[0] + `;
					border-right: 2px solid ` + color[0] + `;`;

    // mở tag
    var s = `<div class="boxProduct" style="` + borderColor + `">
				<h3 class="tenKhung" style="` + gradient + `">* ` + tenKhung + ` *</h3>
				<div class="listSpTrongKhung flexContain">`;

    for (var i = 0; i < list_sanpham.length; i++) {
        s += addProduct(list_sanpham[i], null, true);
        // truyền vào 'true' để trả về chuỗi rồi gán vào s
    }

    // Addkhung vào contain-khung
    ele.innerHTML += s;
}

/// gợi ý Products
function suggestion() {
    // ====== Lay ra thong tin san pham hien tai ====== 
    const giaSanPhamHienTai = stringToNum(sanPhamHienTai.price);

    // ====== Search các sản phẩm tương tự theo tiêu chí ====== 
    const sanPhamTuongTu = list_products
        // Lọc sản phẩm trùng
        .filter((_) => _.masp !== sanPhamHienTai.masp)
        // Tính điểm cho từng sản phẩm
        .map(sanPham => {
            // Tiêu chí 1: giá Products ko lệch nhau quá 1 million
            const giaProduct = stringToNum(sanPham.price);
            let giaTienGanGiong = Math.abs(giaProduct - giaSanPhamHienTai) < 1000000;

            // Tiêu chí 2: các  giống nhau
            let soLuongChiTietGiongNhau = 0;
            for (let key in sanPham.detail) {
                let value = sanPham.detail[key];
                let currentValue = sanPhamHienTai.detail[key];

                if (value == currentValue) soLuongChiTietGiongNhau++;
            }
            let giongThongSoKyThuat = soLuongChiTietGiongNhau >= 3;

            // Tiêu chí 3: cùng hãng sản xuất 
            let cungLoaiHang = sanPham.company === sanPhamHienTai.company

            // Tiêu chí 4: cùng loại khuyến mãi
            let cungLoaiKhuyenMai = sanPham.promo?.name === sanPhamHienTai.promo?.name;

            // Tiêu chí 5: có rated, số Star
            let soDanhGia = Number.parseInt(sanPham.rateCount, 10)
            let soSao = Number.parseInt(sanPham.star, 10);

            // Tính điểm cho Products này (càng thoả nhiều tiêu chí điểm càng cao => càng nên gợi ý)
            let diem = 0;
            if (giaTienGanGiong) diem += 20;
            if (giongThongSoKyThuat) diem += soLuongChiTietGiongNhau;
            if (cungLoaiHang) diem += 15;
            if (cungLoaiKhuyenMai) diem += 10;
            if (soDanhGia > 0) diem += (soDanhGia + '').length;
            diem += soSao;

            // Add thuộc tính diem vào dữ liệu trả về
            return {
                ...sanPham,
                diem: diem
            };
        })
        // Sort theo số điểm cao xuống thấp
        .sort((a, b) => b.diem - a.diem)
        // Lấy ra 10 Products đầu tiên
        .slice(0, 5);

    console.log(sanPhamTuongTu)

    // ====== Hiển thị 5 Products lên web ====== 
    if (sanPhamTuongTu.length) {
        let div = document.getElementById('goiYSanPham');
        addboxProduct(sanPhamTuongTu, 'Propose', ['#434aa8', '#ec1f1f'], div);
    }
}