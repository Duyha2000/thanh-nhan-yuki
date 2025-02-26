var TOTAL = 0;

window.onload = function () {
    // get data from localstorage
    list_products = getListProducts() || list_products;
    adminInfo = getListAdmin() || adminInfo;

    addEventChangeTab();

    if (window.localStorage.getItem('admin')) {
        addTableProducts();
        addTableDonHang();
        addTableKhachHang();
        addThongKe();

        openTab('Homepage')
    } else {
        document.body.innerHTML = `<h1 style="color:red; with:100%; text-align:center; margin: 50px;"> Access is denied.. </h1>`;
    }
}

// logout
function logOutAdmin() {
    alert('This action will return to the Homepage')
    window.localStorage.removeItem('admin');
}

function getListRandomColor(length) {
    let result = [];
    for (let i = length; i--;) {
        result.push(getRandomColor());
    }
    return result;
}

// chart
function addChart(id, chartOption) {
    var ctx = document.getElementById(id).getContext('2d');
    var chart = new Chart(ctx, chartOption);
}

// create Chart
function createChartConfig(
    title = 'Title',
    charType = 'bar',
    labels = ['nothing'],
    data = [2],
    colors = ['red'],
) {
    return {
        type: charType,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: colors,
                borderColor: colors,
            }]
        },
        options: {
            title: {
                fontColor: '#fff',
                fontSize: 25,
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };
}

// Statistical
function addThongKe() {
    var danhSachDonHang = getListDonHang(true);

    var thongKeHang = {}; // Type statistics

    danhSachDonHang.forEach(order => {
        // If the Order is canceled, it will not be counted in the sold quantity
        if (order.tinhTrang === 'Declined') return;

        // Loop through each products in Order
        order.sp.forEach(sanPhamTrongDonHang => {
            let tenHang = sanPhamTrongDonHang.sanPham.company;
            let soLuong = sanPhamTrongDonHang.soLuong;
            let donGia = stringToNum(sanPhamTrongDonHang.sanPham.price);
            let thanhTien = soLuong * donGia;

            if (!thongKeHang[tenHang]) {
                thongKeHang[tenHang] = {
                    soLuongBanRa: 0,
                    doanhThu: 0,
                }
            }

            thongKeHang[tenHang].soLuongBanRa += soLuong;
            thongKeHang[tenHang].doanhThu += thanhTien;
        })
    })


    // Get ramdom color to draw chart
    let colors = getListRandomColor(Object.keys(thongKeHang).length);

    // Add statistical (collum chart)
    addChart('myChart1', createChartConfig(
        'SOLD',
        'bar',
        Object.keys(thongKeHang),
        Object.values(thongKeHang).map(_ => _.soLuongBanRa),
        colors,
    ));
    // Add statistical (circle chart)
    addChart('myChart2', createChartConfig(
        'REVENUE',
        'doughnut',
        Object.keys(thongKeHang),
        Object.values(thongKeHang).map(_ => _.doanhThu),
        colors,
    ));
}

// ======================= Other Tab =========================

function addEventChangeTab() {
    var sidebar = document.getElementsByClassName('sidebar')[0];
    var list_a = sidebar.getElementsByTagName('a');
    for (var a of list_a) {
        if (!a.onclick) {
            a.addEventListener('click', function () {
                turnOff_Active();
                this.classList.add('active');
                var tab = this.childNodes[1].data.trim()
                openTab(tab);
            })
        }
    }
}

function turnOff_Active() {
    var sidebar = document.getElementsByClassName('sidebar')[0];
    var list_a = sidebar.getElementsByTagName('a');
    for (var a of list_a) {
        a.classList.remove('active');
    }
}

function openTab(nameTab) {
    // Hidden all
    var main = document.getElementsByClassName('main')[0].children;
    for (var e of main) {
        e.style.display = 'none';
    }

    // Open tab
    switch (nameTab) {
        case 'Homepage': document.getElementsByClassName('home')[0].style.display = 'block'; break;
        case 'Product': document.getElementsByClassName('sanpham')[0].style.display = 'block'; break;
        case 'Order': document.getElementsByClassName('donhang')[0].style.display = 'block'; break;
        case 'User': document.getElementsByClassName('khachhang')[0].style.display = 'block'; break;
    }
}

// ========================== Product ========================
// Draw list_product
function addTableProducts() {
    var tc = document.getElementsByClassName('sanpham')[0].getElementsByClassName('table-content')[0];
    var s = `<table class="table-outline hideImg">`;

    for (var i = 0; i < list_products.length; i++) {
        var p = list_products[i];
        s += `<tr>
            <td style="width: 5%">` + (i + 1) + `</td>
            <td style="width: 10%">` + p.masp + `</td>
            <td style="width: 40%">
                <a title="Details" target="_blank" href="productDetail.html?` + p.name.split(' ').join('-') + `">` + p.name + `</a>
                <img src="` + p.img + `"></img>
            </td>
            <td style="width: 15%">` + p.price + `</td>
            <td style="width: 15%">` + promoToStringValue(p.promo) + `</td>
            <td style="width: 15%">
                <div class="tooltip">
                    <i class="fa fa-wrench" onclick="addKhungSuaSanPham('` + p.masp + `')"></i>
                    <span class="tooltiptext">Edit</span>
                </div>
                <div class="tooltip">
                    <i class="fa-solid fa-trash-can" onclick="deleteProduct('` + p.masp + `', '` + p.name + `')"></i>
                    <span class="tooltiptext">Delete</span>
                </div>
            </td>
        </tr>`;
    }

    s += `</table>`;

    tc.innerHTML = s;
}

// Search
function timKiemSanPham(inp) {
    var kieuTim = document.getElementsByName('kieuTimSanPham')[0].value;
    var text = inp.value;

    // Sort
    var vitriKieuTim = { 'ma': 1, 'ten': 2 }; 

    var listTr_table = document.getElementsByClassName('sanpham')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[vitriKieuTim[kieuTim]].innerHTML.toLowerCase();

        if (td.indexOf(text.toLowerCase()) < 0) {
            tr.style.display = 'none';
        } else {
            tr.style.display = '';
        }
    }
}


let previewSrc; 
// Get data
function layThongTinProductTuTable(id) {
    var khung = document.getElementById(id);
    var tr = khung.getElementsByTagName('tr');

    var masp = tr[1].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var name = tr[2].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var company = tr[3].getElementsByTagName('td')[1].getElementsByTagName('select')[0].value;
    var img = tr[4].getElementsByTagName('td')[1].getElementsByTagName('img')[0].src;
    var price = tr[5].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var star = tr[6].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var rateCount = tr[7].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var promoName = tr[8].getElementsByTagName('td')[1].getElementsByTagName('select')[0].value;
    var promoValue = tr[9].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;

    var screen = tr[11].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var os = tr[12].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var camara = tr[13].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var camaraFront = tr[14].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var cpu = tr[15].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var ram = tr[16].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var rom = tr[17].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var microUSB = tr[18].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var battery = tr[19].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;

    if (isNaN(price)) {
        alert('Price must be an integer');
        return false;
    }

    if (isNaN(star)) {
        alert('Star (0->5) must be an integer');
        return false;
    }

    if (isNaN(rateCount)) {
        alert('Rated number must be an integer');
        return false;
    }

    try {
        return {
            "name": name,
            "company": company,
            "img": previewSrc,
            "price": numToString(Number.parseInt(price, 10)),
            "star": Number.parseInt(star, 10),
            "rateCount": Number.parseInt(rateCount, 10),
            "promo": {
                "name": promoName,
                "value": promoValue
            },
            "detail": {
                "screen": screen,
                "os": os,
                "camara": camara,
                "camaraFront": camaraFront,
                "cpu": cpu,
                "ram": ram,
                "rom": rom,
                "microUSB": microUSB,
                "battery": battery
            },
            "masp": masp
        }
    } catch (e) {
        alert('Error: ' + e.toString());
        return false;
    }
}
// Add product
function addProduct() {
    var newSp = layThongTinProductTuTable('khungThemSanPham');
    if (!newSp) return;

    for (var p of list_products) {
        if (p.masp == newSp.masp) {
            alert('Product Code is duplicated !!');
            return false;
        }

        if (p.name == newSp.name) {
            alert('Products Name is duplicated!!');
            return false;
        }
    }
    // Add product to list_product
    list_products.push(newSp);

    // Save to LocalStorage
    setListProducts(list_products);

    // Redraw table
    addTableProducts();

    alert('Add Products "' + newSp.name + '" successful.');
    document.getElementById('khungThemSanPham').style.transform = 'scale(0)';
}

// Create Product code
function autoMaProduct(company) {
    
    if (!company) company = document.getElementsByName('type')[0].value;
    var index = 0;
    for (var i = 0; i < list_products.length; i++) {
        if (list_products[i].type == type) {
            index++;
        }
    }
    document.getElementById('maspThem').value = type.substring(0, 3) + index;
}

// Delete
function deleteProduct(masp, tensp) {
    if (window.confirm('Delete this? Are you sure?  ' + tensp+' ?')) {
        // Delete
        for (var i = 0; i < list_products.length; i++) {
            if (list_products[i].masp == masp) {
                list_products.splice(i, 1);
            }
        }

        // Save to localstorage
        setListProducts(list_products);

        // Redraw table
        addTableProducts();
    }
}

// Edit
function suaSanPham(masp) {
    var sp = layThongTinProductTuTable('khungSuaSanPham');
    if (!sp) return;

    for (var p of list_products) {
        if (p.masp == masp && p.masp != sp.masp) {
            alert('Product Code is duplicated !!');
            return false;
        }

        if (p.name == sp.name && p.masp != sp.masp) {
            alert('Products name is duplicated !!');
            return false;
        }
    }

    for (var i = 0; i < list_products.length; i++) {
        if (list_products[i].masp == masp) {
            list_products[i] = sp;
        }
    }

    // Save to localstorage
    setListProducts(list_products);

    // Redraw table
    addTableProducts();

    alert('Edit ' + sp.name + ' successful');

    document.getElementById('khungSuaSanPham').style.transform = 'scale(0)';
}

function addKhungSuaSanPham(masp) {
    var sp;
    for (var p of list_products) {
        if (p.masp == masp) {
            sp = p;
        }
    }

    var s = `
    <span class="close" onclick="this.parentElement.style.transform = 'scale(0)';">&times;</span>
    <table class="overlayTable table-outline table-content table-header">
        <tr>
            <th colspan="2">`+ sp.name + `</th>
        </tr>
        <tr>
            <td>Product Code:</td>
            <td><input type="text" value="`+ sp.masp + `"></td>
        </tr>
        <tr>
            <td>Product Name:</td>
            <td><input type="text" value="`+ sp.name + `"></td>
        </tr>
        <tr>
            <td>Type:</td>
            <td>
                <select>
            `

    var company = ["Mac", "Iphone", "Airpods", "Ipad", "Watch"];
    for (var c of company) {
        if (sp.company == c)
            s += (`<option value="` + c + `" selected>` + c + `</option>`);
        else s += (`<option value="` + c + `">` + c + `</option>`);
    }

    s += `
                </select>
            </td>
        </tr>
        <tr>
            <td>Image:</td>
            <td>
                <img class="hinhDaiDien" id="anhDaiDienSanPhamSua" src="`+ sp.img + `">
                <input type="file" accept="image/*" onchange="capNhatAnhSanPham(this.files, 'anhDaiDienSanPhamSua')">
            </td>
        </tr>
        <tr>
            <td>Price (Integer):</td>
            <td><input type="text" value="`+ stringToNum(sp.price) + `"></td>
        </tr>
        <tr>
            <td>Star (0->5) :</td>
            <td><input type="text" value="`+ sp.star + `"></td>
        </tr>
        <tr>
            <td>Rated:</td>
            <td><input type="text" value="`+ sp.rateCount + `"></td>
        </tr>
        <tr>
            <td>Promo:</td>
            <td>
                <select>
                    <option value="">none</option>
                    <option value="tragop" `+ (sp.promo.name == 'tragop' ? 'selected' : '') + `>Installment</option>
                    <option value="giamgia" `+ (sp.promo.name == 'giamgia' ? 'selected' : '') + `>Discount</option>
                    <option value="giareonline" `+ (sp.promo.name == 'giareonline' ? 'selected' : '') + `>Shockings Prices Online</option>
                    <option value="moiramat" `+ (sp.promo.name == 'moiramat' ? 'selected' : '') + `>New</option>
                </select>
            </td>
        </tr>
        <tr>
            <td>Promo value:</td>
            <td>
                <input type="text" value="`+ sp.promo.value + `">
            </td>
        </tr>
        <tr>
            <th colspan="2">Specifications</th>
        </tr>
        <tr>
            <td>Screen:</td>
            <td><input type="text" value="`+ sp.detail.screen + `"></td>
        </tr>
        <tr>
            <td>Operating system:</td>
            <td><input type="text" value="`+ sp.detail.os + `"></td>
        </tr>
        <tr>
            <td>Rear camera:</td>
            <td><input type="text" value="`+ sp.detail.camara + `"></td>
        </tr>
        <tr>
            <td>Front camera:</td>
            <td><input type="text" value="`+ sp.detail.camaraFront + `"></td>
        </tr>
        <tr>
            <td>CPU:</td>
            <td><input type="text" value="`+ sp.detail.cpu + `"></td>
        </tr>
        <tr>
            <td>RAM:</td>
            <td><input type="text" value="`+ sp.detail.ram + `"></td>
        </tr>
        <tr>
            <td>Internal memory:</td>
            <td><input type="text" value="`+ sp.detail.rom + `"></td>
        </tr>
        <tr>
            <td>Memory Stick:</td>
            <td><input type="text" value="`+ sp.detail.microUSB + `"></td>
        </tr>
        <tr>
            <td>Battery capacity:</td>
            <td><input type="text" value="`+ sp.detail.battery + `"></td>
        </tr>
        <tr>
            <td colspan="2"  class="table-footer"> <button onclick="suaSanPham('`+ sp.masp + `')">Edit</button> </td>
        </tr>
    </table>`

    var khung = document.getElementById('khungSuaSanPham');
    khung.innerHTML = s;
    khung.style.transform = 'scale(1)';
}

// Update products picture
function capNhatAnhSanPham(files, id) {

    const reader = new FileReader();
    reader.addEventListener("load", function () {
       
        previewSrc = reader.result;
        document.getElementById(id).src = previewSrc;
    }, false);

    if (files[0]) {
        reader.readAsDataURL(files[0]);
    }
}

// Product sort
function sortProductsTable(loai) {
    var list = document.getElementsByClassName('sanpham')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length - 1, loai, getValueOfTypeInTable_SanPham); 
    // type allows choosing to sort by code or name or price... 
    decrease = !decrease;
}

// Get the value of a certain type (column) of data in the table
function getValueOfTypeInTable_SanPham(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch (loai) {
        case 'stt': return Number(td[0].innerHTML);
        case 'masp': return td[1].innerHTML.toLowerCase();
        case 'ten': return td[2].innerHTML.toLowerCase();
        case 'gia': return stringToNum(td[3].innerHTML);
        case 'khuyenmai': return td[4].innerHTML.toLowerCase();
    }
    return false;
}

// ========================= Order ===========================
// Draw Table
function addTableDonHang() {
    var tc = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0];
    var s = `<table class="table-outline hideImg">`;

    var listDH = getListDonHang();

    TOTAL = 0;
    for (var i = 0; i < listDH.length; i++) {
        var d = listDH[i];
        s += `<tr>
            <td style="width: 5%">` + (i + 1) + `</td>
            <td style="width: 13%">` + d.ma + `</td>
            <td style="width: 7%">` + d.khach + `</td>
            <td style="width: 20%">` + d.sp + `</td>
            <td style="width: 15%">` + d.total + `</td>
            <td style="width: 10%">` + d.ngaygio + `</td>
            <td style="width: 10%">` + d.tinhTrang + `</td>
            <td style="width: 10%">
                <div class="tooltip">
                    <i class="fa fa-check" onclick="approve('`+ d.ma + `', true)"></i>
                    <span class="tooltiptext">Approve</span>
                </div>
                <div class="tooltip">
                    <i class="fa fa-remove" onclick="approve('`+ d.ma + `', false)"></i>
                    <span class="tooltiptext">Cancel</span>
                </div>
                
            </td>
        </tr>`;
        TOTAL += stringToNum(d.total);
    }

    s += `</table>`;
    tc.innerHTML = s;
}

function getListDonHang(traVeDanhSachSanPham = false) {
    var u = getListUser();
    var result = [];
    localStorage.removeItem("aaa");
    for (var i = 0; i < u.length; i++) {
        for (var j = 0; j < u[i].donhang.length; j++) {
            // Total
            var total = 0;
            for (var s of u[i].donhang[j].sp) {
                var timsp = timKiemTheoMa(list_products, s.ma);
                // console.log(timsp);
                if (timsp.promo.name == 'giareonline') total += stringToNum(timsp.promo.value);
                
                else total += stringToNum(timsp.price);
            }

            // Date
            var x = new Date(u[i].donhang[j].ngaymua).toLocaleString();
            console.log(x);

            // Products (html)
            var sps = '';
            for (var s of u[i].donhang[j].sp) {
                sps += `<p style="text-align: right">` + (timKiemTheoMa(list_products, s.ma).name + ' [' + s.soluong + ']') + `</p>`;
            }
            console.log(sps);

            // Products (array)
            var danhSachProduct = [];
            for (var s of u[i].donhang[j].sp) {
                danhSachProduct.push({
                    sanPham: timKiemTheoMa(list_products, s.ma),
                    soLuong: s.soluong,
                });
            }

            // Save to result
            result.push({
                "ma": u[i].donhang[j].ngaymua.toString(),
                "khach": u[i].username,
                "sp": traVeDanhSachSanPham ? danhSachProduct : sps,
                "total": numToString(total),
                "ngaygio": x,
                "tinhTrang": u[i].donhang[j].tinhTrang
            });
        }
    }
    return result;
}

// approve
function approve(maDonHang, duyetDon) {
    var u = getListUser();
    for(var i = 0; i < u.length; i++) {
        for(var j = 0; j < u[i].donhang.length; j++) {
            if(u[i].donhang[j].ngaymua == maDonHang) {
                if(duyetDon) {
                    if (u[i].donhang[j].tinhTrang == 'Pending') {
                        u[i].donhang[j].tinhTrang = 'Delivered';
                    } else if (u[i].donhang[j].tinhTrang == 'Declined') {
                        alert('Cannot approve a canceled order!');
                        return;
                    }
                } else {
                    if (u[i].donhang[j].tinhTrang == 'Pending') {
                        if (window.confirm('Are you sure you want to cancel this order? This action cannot redo!')) {
                            u[i].donhang[j].tinhTrang = 'Declined';
                        }
                    } else if (u[i].donhang[j].tinhTrang == 'Delivered') {
                        alert('Cannot cancel a delivered order!');
                        return;
                    }
                }
                break;
            }
        }
    }
    // save
    setListUser(u);

    // draw again
    addTableDonHang();
}
// Sort by date
function locOrderTheoKhoangNgay() {
    var from = document.getElementById('fromDate').valueAsDate;
    var to = document.getElementById('toDate').valueAsDate;

    var listTr_table = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[5].innerHTML;
        var d = new Date(td);

        if (d >= from && d <= to) {
            tr.style.display = '';
        } else {
            tr.style.display = 'none';
        }
    }
}
// Sort by Oders
function timKiemDonHang(inp) {
    var kieuTim = document.getElementsByName('kieuTimOrder')[0].value;
    var text = inp.value;

    // Filter
    var vitriKieuTim = { 'ma': 1, 'khachhang': 2, 'trangThai': 6 };

    var listTr_table = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[vitriKieuTim[kieuTim]].innerHTML.toLowerCase();

        if (td.indexOf(text.toLowerCase()) < 0) {
            tr.style.display = 'none';
        } else {
            tr.style.display = '';
        }
    }
}

// Sort
function sortOrderTable(loai) {
    var list = document.getElementsByClassName('donhang')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length - 1, loai, getValueOfTypeInTable_Order);
    decrease = !decrease;
}

// Get the value of a certain type (column) of data in the table
function getValueOfTypeInTable_Order(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch (loai) {
        case 'stt': return Number(td[0].innerHTML);
        // Convert to date
        case 'ma': return new Date(td[1].innerHTML);
         // Get username
        case 'khach': return td[2].innerHTML.toLowerCase();
       // Get the number of rows in this order (length is the quantity)
        case 'sanpham': return td[3].children.length;
        // Returns price
        case 'total': return stringToNum(td[4].innerHTML);
        // Return date
        case 'ngaygio': return new Date(td[5].innerHTML);
        //Status
        case 'trangthai': return td[6].innerHTML.toLowerCase();
    }
    return false;
}

// ====================== User =============================
// Draw table
function addTableKhachHang() {
    var tc = document.getElementsByClassName('khachhang')[0].getElementsByClassName('table-content')[0];
    var s = `<table class="table-outline hideImg">`;

    var listUser = getListUser();

    for (var i = 0; i < listUser.length; i++) {
        var u = listUser[i];
        s += `<tr>
            <td style="width: 5%">` + (i + 1) + `</td>
            <td style="width: 15%">` + u.ho + ' ' + u.ten + `</td>
            <td style="width: 20%">` + u.email + `</td>
            <td style="width: 20%">` + u.username + `</td>
            <td style="width: 10%">` + u.pass + `</td>
            <td style="width: 10%">
                <div class="tooltip">
                    <label class="switch">
                        <input type="checkbox" `+ (u.off ? '' : 'checked') + ` onclick="voHieuHoaUser(this, '` + u.username + `')">
                        <span class="slider round"></span>
                    </label>
                    <span class="tooltiptext">`+ (u.off ? 'Unlock' : 'Lock') + `</span>
                </div>
                <div class="tooltip">
                    <i class="fa fa-remove" onclick="deleteUser('`+ u.username + `')"></i>
                    <span class="tooltiptext">Delete</span>
                </div>
            </td>
        </tr>`;
    }

    s += `</table>`;
    tc.innerHTML = s;
}

// Search
function timKiemUser(inp) {
    var kieuTim = document.getElementsByName('kieuTimKhachHang')[0].value;
    var text = inp.value;

    // Filter
    var vitriKieuTim = { 'ten': 1, 'email': 2, 'account': 3 };

    var listTr_table = document.getElementsByClassName('khachhang')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[vitriKieuTim[kieuTim]].innerHTML.toLowerCase();

        if (td.indexOf(text.toLowerCase()) < 0) {
            tr.style.display = 'none';
        } else {
            tr.style.display = '';
        }
    }
}
// Open User
function openThemUser() {
    window.alert('Not Available!');
}

// Disable user
function voHieuHoaUser(inp, account) {
    var listUser = getListUser();
    for (var u of listUser) {
        if (u.username == account) {
            let value = !inp.checked
            u.off = value;
            setListUser(listUser);

            setTimeout(() => {
                alert(`${value ? 'Lock' : 'Unlock'} account "${u.username}" successful.`);
            }, 500);
            
            break;
        }
    }
    var span = inp.parentElement.nextElementSibling;
    span.innerHTML = (inp.checked ? 'Lock' : 'Unlock');
}

// Delete user
function deleteUser(account) {
    if (window.confirm('Confirm DELETE ALL "' + account + '" Account ?' + ' \n All Data of ' + account + " will be lost! (Including the Order's of " + account +")")) {
        var listuser = getListUser();
        for (var i = 0; i < listuser.length; i++) {
            if (listuser[i].username == account) {
                listuser.splice(i, 1);// delete
                setListUser(listuser);// Save
                localStorage.removeItem('CurrentUser');// Sign out of current account user
                addTableKhachHang();// Redraw the User table
                addTableDonHang();// Redraw the Order table
                return;
            }
        }
    }
}

// Sort
function sortKhachHangTable(loai) {
    var list = document.getElementsByClassName('khachhang')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length - 1, loai, getValueOfTypeInTable_KhachHang);
    decrease = !decrease;
}

function getValueOfTypeInTable_KhachHang(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch (loai) {
        case 'stt': return Number(td[0].innerHTML);
        case 'fullName': return td[1].innerHTML.toLowerCase();
        case 'email': return td[2].innerHTML.toLowerCase();
        case 'account': return td[3].innerHTML.toLowerCase();
        case 'password': return td[4].innerHTML.toLowerCase();
    }
    return false;
}

// ================== Sort ====================
var decrease = true; // Sort decrease

function quickSort(arr, left, right, loai, func) {
    var pivot,
        partitionIndex;

    if (left < right) {
        pivot = right;
        partitionIndex = partition(arr, pivot, left, right, loai, func);

        //sort left and right
        quickSort(arr, left, partitionIndex - 1, loai, func);
        quickSort(arr, partitionIndex + 1, right, loai, func);
    }
    return arr;
}

function partition(arr, pivot, left, right, loai, func) {
    var pivotValue = func(arr[pivot], loai),
        partitionIndex = left;

    for (var i = left; i < right; i++) {
        if (decrease && func(arr[i], loai) > pivotValue
            || !decrease && func(arr[i], loai) < pivotValue) {
            swap(arr, i, partitionIndex);
            partitionIndex++;
        }
    }
    swap(arr, right, partitionIndex);
    return partitionIndex;
}

function swap(arr, i, j) {
    var tempi = arr[i].cloneNode(true);
    var tempj = arr[j].cloneNode(true);
    arr[i].parentNode.replaceChild(tempj, arr[i]);
    arr[j].parentNode.replaceChild(tempi, arr[j]);
}

// ================= Add Function ====================
function promoToStringValue(pr) {
    switch (pr.name) {
        case 'tragop':
            return 'Inst ' + pr.value + '%';
        case 'giamgia':
            return 'Reduce ' + pr.value;
        case 'giareonline':
            return 'Online (' + pr.value + ')';
        case 'moiramat':
            return 'New';
    }
    return '';
}

function progress(percent, bg, width, height) {
    return `<div class="progress" style="width: ` + width + `; height:` + height + `">
                <div class="progress-bar bg-info" style="width: ` + percent + `%; background-color:` + bg + `"></div>
            </div>`
}
