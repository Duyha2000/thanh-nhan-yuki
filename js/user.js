var currentUser;
var totalAmountAllOrder = 0; 
// lưu tổng tiền from tất cả các Order đã mua
var tongProductTatCaOrder = 0;

window.onload = function () {
    init();

    // autocomplete cho khung tim kiem
    autocomplete(document.getElementById('search-box'), list_products);

    // Addtags (from khóa) vào khung Search
    var tags = ["Mac", "Iphone", "Airpods", "Ipad", "Watch"];
    for (var t of tags) addTags(t, "index.html?search=" + t);

    currentUser = getCurrentUser();

    if (currentUser) {
        // cập nhật from list user, do trong admin chỉ tác động tới listuser
        var listUser = getListUser();
        for (var u of listUser) {
            if (equalUser(currentUser, u)) {
                currentUser = u;
                setCurrentUser(u);
            }
        }

        addTatCaOrder(currentUser); // hàm này cần chạy trước để tính được tổng tiền tất cả Order 
        addInfoUser(currentUser);
    
    } else {
        var warning = `<h2 style="color: red; font-weight:bold; text-align:center; font-size: 2em; padding: 50px;">
                            You are not logged in. !!
                        </h2>`;
        document.getElementsByClassName('infoUser')[0].innerHTML = warning;
    }
}

// Phần Thông tin người dùng
function addInfoUser(user) {
    if (!user) return;
    document.getElementsByClassName('infoUser')[0].innerHTML = `
    <hr>
    <table>
        <tr>
            <th colspan="3">CUSTOMER INFORMATION</th>
        </tr>
        <tr>
            <td>Account: </td>
            <td> <input type="text" value="` + user.username + `" readonly> </td>
            <td> <i class="fa-regular fa-pen-to-square" onclick="changeInfo(this, 'username')"></i> </td>
        </tr>
        <tr>
            <td>Password: </td>
            <td style="text-align: center;"> 
                <i class="fa-regular fa-pen-to-square" id="butDoiMatKhau" onclick="openChangePass()" style="display: flex; justify-content: center; margin-left: 10px;cursor: pointer; border-radius:10px; width:250px; height: 25px; align-items: center"> 
                    <div class="changePass--content" style="font-weight: 600;"> Change Password</div>
                </i> 
            </td>
            <td></td>
        </tr>
        <tr>
            <td colspan="3" id="khungDoiMatKhau">
                <table>
                    <tr>
                        <td> <div>Old Password:</div> </td>
                        <td> <div><input type="password"></div> </td>
                    </tr>
                    <tr>
                        <td> <div>New Password:</div> </td>
                        <td> <div><input type="password"></div> </td>
                    </tr>
                    <tr>
                        <td> <div>Confirm password:</div> </td>
                        <td> <div><input type="password"></div> </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td> 
                            <div>
                                <button class="button" onclick="changePass()">
                                    <p>Accept<p>
                                </button>
                            </div> 
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>First Name: </td>
            <td> <input type="text" value="` + user.ho + `" readonly> </td>
            <td> <i class="fa-regular fa-pen-to-square" onclick="changeInfo(this, 'ho')"></i> </td>
        </tr>
        <tr>
            <td>Last Name: </td>
            <td> <input type="text" value="` + user.ten + `" readonly> </td>
            <td> <i class="fa-regular fa-pen-to-square" onclick="changeInfo(this, 'ten')"></i> </td>
        </tr>
        <tr>
            <td>Email: </td>
            <td> <input type="text" value="` + user.email + `" readonly> </td>
            <td> <i class="fa-regular fa-pen-to-square" onclick="changeInfo(this, 'email')"></i> </td>
        </tr>
        <tr>
            <td colspan="3" style="padding:5px; border-top: 2px solid #ccc;"></td>
        </tr>
        <tr>
            <td style="font-size:22px; color:#ff8f9c">
                TOTAL : 
            </td>

            <td> 
                <input type="text" value="` + numToString(totalAmountAllOrder) + `₫" readonly style="font-size:22px; font-weight:600"> 
            </td>
            <td></td>
        </tr>
        <tr>
            <td style="font-size:22px; color:#ff8f9c">
                QUANTITY: 
            </td>

            <td> 
                <input type="text" value="` + tongProductTatCaOrder + `" readonly style="font-size:22px; font-weight:600"> 
            </td>
            <td></td>
        </tr>
    </table>`;
}

function openChangePass() {
    var khungChangePass = document.getElementById('khungDoiMatKhau');
    var actived = khungChangePass.classList.contains('active');
    if (actived) khungChangePass.classList.remove('active');
    else khungChangePass.classList.add('active');
}

function changePass() {
    var khungChangePass = document.getElementById('khungDoiMatKhau');
    var inps = khungChangePass.getElementsByTagName('input');
    if (inps[0].value != currentUser.pass) {
        addAlertBox('Wrong password !!. Try again ','red','#fff',2000);
        inps[0].focus();
        return;
    }

    if (inps[1].length < 3 || /[^a-zA-Z0-9]/.test(inps[1])) {
        addAlertBox('New Password must be at least 3 characters long, and should not contain special characters.', 'red', '#fff', 2000);
        return false;
    }

    if (inps[1] == '') {
        inps[1].focus();
        addAlertBox("You haven't entered the new password yet !",'red','#fff',2000);
    }

    if (inps[1].value != inps[2].value) {
        addAlertBox('Passwords does not match !!');
        inps[2].focus();
        return;
    }

    var temp = copyObject(currentUser);
    currentUser.pass = inps[1].value;

    // cập nhật danh sách Products trong localstorage
    setCurrentUser(currentUser);
    updateListUser(temp, currentUser);

    // Cập nhật trên header
    capNhat_ThongTin_CurrentUser();

    // thông báo
    inps[0].value = '';
    inps[1].value = '';
    inps[2].value = '';
    addAlertBox('Password updated successfully.', '#5f5', '#000', 4000);
    openChangePass();
}

function changeInfo(iTag, info) {
    var inp = iTag.parentElement.previousElementSibling.getElementsByTagName('input')[0];

    // Đang hiện
    if (!inp.readOnly && inp.value != '') {

        if (info == 'username') {
            var users = getListUser();
            for (var u of users) {
                if (u.username == inp.value && u.username != currentUser.username) {
                    alert('Username has been used !!');
                    inp.value = currentUser.username;
                    return;
                }
            }
            // Đổi tên trong list Order
            if (!currentUser.donhang.length) {
                document.getElementsByClassName('listOrder')[0].innerHTML = `
                    <h3> 
                        Hello "` + inp.value + `". You don't have any orders yet.
                    </h3>`;
            }


        } else if (info == 'email') {
            var users = getListUser();
            for (var u of users) {
                if (u.email == inp.value && u.username != currentUser.username) {
                    alert('Email is already in use !!');
                    inp.value = currentUser.email;
                    return;
                }
            }
        }

        var temp = copyObject(currentUser);
        currentUser[info] = inp.value;

        // cập nhật danh sách Products trong localstorage
        setCurrentUser(currentUser);
        updateListUser(temp, currentUser);

        // Cập nhật trên header
        capNhat_ThongTin_CurrentUser();

        iTag.innerHTML = '';

    } else {
        iTag.innerHTML = 'Accept';
        inp.focus();
        var v = inp.value;
        inp.value = '';
        inp.value = v;
    }

    inp.readOnly = !inp.readOnly;
}


// Phần thông tin Order
function addTatCaOrder(user) {
    if (!user) {
        document.getElementsByClassName('listOrder')[0].innerHTML = `
            <h3 style="width=100%; padding: 50px; color: red; font-size: 2em; text-align: center"> 
                You are not logged in.!!
            </h3>`;
        return;
    }
    if (!user.donhang.length) {
        document.getElementsByClassName('listOrder')[0].innerHTML = `
            <h3> 
                Hello "` + currentUser.username + `". You don't have any orders yet.
            </h3>`;
        return;
    }
    for (var dh of user.donhang) {
        addOrder(dh);
    }
}

function addOrder(dh) {
    var div = document.getElementsByClassName('listOrder')[0];

    var s = `
            <table class="listProduct">
                <tr> 
                    <th colspan="6">
                        <h3 style="text-align:center;"> Order Date: ` + new Date(dh.ngaymua).toLocaleString() + `</h3> 
                    </th>
                </tr>
                <tr>
                    <th>STT</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Number</th>
                    <th>Total Cost</th>
                    <th>Time Addto Cart</th> 
                </tr>`;

    var totalPrice = 0;
    for (var i = 0; i < dh.sp.length; i++) {
        var masp = dh.sp[i].ma;
        var soluongSp = dh.sp[i].soluong;
        var p = timKiemTheoMa(list_products, masp);
        var price = (p.promo.name == 'giareonline' ? p.promo.value : p.price);
        var thoigian = new Date(dh.sp[i].date).toLocaleString();
        var thanhtien = stringToNum(price) * soluongSp;

        s += `
                <tr>
                    <td>` + (i + 1) + `</td>
                    <td class="noPadding imgHide">
                        <a target="_blank" href="productDetail.html?` + p.name.split(' ').join('-') + `" title="Details">
                            ` + p.name + `
                            <img src="` + p.img + `">
                        </a>
                    </td>
                    <td class="alignRight">` + price + ` ₫</td>
                    <td class="soluong" >
                         ` + soluongSp + `
                    </td>
                    <td class="alignRight">` + numToString(thanhtien) + ` ₫</td>
                    <td style="text-align: center" >` + thoigian + `</td>
                </tr>
            `;
        totalPrice += thanhtien;
        tongProductTatCaOrder += soluongSp;
    }
    totalAmountAllOrder += totalPrice;

    s += `
                <tr style="font-weight:bold; text-align:center; height: 4em;">
                    <td colspan="4">Total: </td>
                    <td class="alignRight">` + numToString(totalPrice) + ` ₫</td>
                    <td > ` + dh.tinhTrang + ` </td>
                </tr>
            </table>
            <hr>
        `;
    div.innerHTML += s;
}