"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
// mỗi khi khách chọn menu S, M, L bạn lại đổi giá trị properties của nó
var gSelectedMenuStructure = {
    menuName: "...",    // S, M, L
    duongKinhCM: "",
    suonNuong: 0,
    saladGr: "",
    drink: 0,
    priceVND: 0
}
//lưu các thông tin người dùng nhập, chọn đồ uống
var gPersonData = {
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    message: "",
    voucher: "",
    drink: ""
}
var gDrinkData = {}; //lưu object danh sách đồ uống
var gSelectedPizzaType = {
    value: "",
    text: ""
}; // lưu loại pizza đươc chọn
var gOrderResponseObj = {}; //lưu object order response trả về

/*** REGION 2 - Vùng gán / thực thi hàm xử lý sự kiện cho các elements */
$(document).ready(function () {

    $(document).on("click", ".btn-select-pizza-combo", function () {
        onBtnSelectComboPizzaClick(this);
    });
    $(document).on("click", ".btn-select-pizza-type", function () {
        onBtnSelectPizzaTypeClick(this);
    });
    $(document).on("click", "#btn-send", function () {
        onBtnSendClick();
    });
    $(document).on("click", "#modal-detail-btn-confirm", function () {
        onBtnCreatOrderClick();
    })

    //load dữ liệu danh sách đồ uống lấy từ API khi tải trang
    getDrinkList();
    //add sự kiện click vào menu theo dõi đơn hàng
    $("#theo-doi-don-hang").on("click", function () {
        callDropdownOrderId();//Hàm truyền id và orderId của đơn hàng vừa tạo sang trang viewOrder
    })
    //bắt sự kiện change của input voucher; nếu có value mới thì gọi hàm get voucher, trả giá trị vào span ẩn
    $("#inp-voucher").change(function () {
        var bGetVoucher = getVoucherByVoucherCode($("#inp-voucher").val());
        if (bGetVoucher != 0) {
            $("#span-discount")
                .attr("style", "display: inline;")
                .html("Voucher giảm giá: " + bGetVoucher + "%");
        }
        else {
            $("#span-discount").attr("style", "display: none;");
        }
    });
});
/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */

//Hàm xử lý sự kiện click chọn combo Pizza
function onBtnSelectComboPizzaClick(paramSelectCombo) {
    "use strict";
    //Cập nhật thông tin combo
    switch (paramSelectCombo.value) {
        case "S":
            gSelectedMenuStructure.menuName = "S";
            gSelectedMenuStructure.duongKinhCM = "20cm";
            gSelectedMenuStructure.suonNuong = 2;
            gSelectedMenuStructure.saladGr = "200gr";
            gSelectedMenuStructure.drink = 2;
            gSelectedMenuStructure.priceVND = 150000;
            break;
        case "M":
            gSelectedMenuStructure.menuName = "M";
            gSelectedMenuStructure.duongKinhCM = "25cm";
            gSelectedMenuStructure.suonNuong = 4;
            gSelectedMenuStructure.saladGr = "300gr";
            gSelectedMenuStructure.drink = 3;
            gSelectedMenuStructure.priceVND = 200000;
            break;
        case "L":
            gSelectedMenuStructure.menuName = "L";
            gSelectedMenuStructure.duongKinhCM = "30cm";
            gSelectedMenuStructure.suonNuong = 8;
            gSelectedMenuStructure.saladGr = "500gr";
            gSelectedMenuStructure.drink = 4;
            gSelectedMenuStructure.priceVND = 250000;
            break;
    }

    //Thay đổi màu nút được chọn
    //reset màu nút
    $(".btn-select-pizza-combo").removeClass().addClass("btn bg-cyan-700 text-white w-100 btn-select-pizza-combo");
    //thay đổi màu
    switch (paramSelectCombo.value) {
        case "S":
            $(".btn-select-pizza-combo[value='S']").removeClass().addClass("btn btn-warning w-100 btn-select-pizza-combo");
            break;
        case "M":
            $(".btn-select-pizza-combo[value='M']").removeClass().addClass("btn btn-warning w-100 btn-select-pizza-combo");
            break;
        case "L":
            $(".btn-select-pizza-combo[value='L']").removeClass().addClass("btn btn-warning w-100 btn-select-pizza-combo");
            break;
    }
}
//hàm xử lý sự kiện click chọn loại pizza
function onBtnSelectPizzaTypeClick(paramPizzaType) {
    "use strict";
    //cập nhật thông tin loại pizza
    switch (paramPizzaType.value) {
        case "hawaii":
            gSelectedPizzaType.value = "hawaii";
            gSelectedPizzaType.text = "Hawaii";
            break;
        case "seafood":
            gSelectedPizzaType.value = "seafood";
            gSelectedPizzaType.text = "Hải sản";
            break;
        case "bacon":
            gSelectedPizzaType.value = "bacon";
            gSelectedPizzaType.text = "Thịt hun khói";
            break;
    }
    //thay đổi màu nút
    //reset màu nút
    $(".btn-select-pizza-type").removeClass().addClass("btn bg-cyan-700 text-white w-100 btn-select-pizza-type");
    //thay đổi màu
    switch (gSelectedPizzaType.value) {
        case "hawaii":
            $(".btn-select-pizza-type[value='hawaii']").removeClass().addClass("btn btn-warning w-100 btn-select-pizza-type");
            break;
        case "seafood":
            $(".btn-select-pizza-type[value='seafood']").removeClass().addClass("btn btn-warning w-100 btn-select-pizza-type");
            break;
        case "bacon":
            $(".btn-select-pizza-type[value='bacon']").removeClass().addClass("btn btn-warning w-100 btn-select-pizza-type");
            break;
    }
}

//Hàm xử lý sự kiện click nút send: thu thập dữ liệu nhập và chọn trên form, kiểm tra dữ liệu, hiển thị dữ liệu vào vùng xanh ẩn
function onBtnSendClick() {
    "use strict";
    //1. thu thập dữ liệu
    getPersonData();
    //2. validate
    if ($("form")[0].checkValidity()) {
        var vIsValided = validateFormData();
        if (vIsValided) {
            //3. xử lý hiển thị
            showModalOrderDetail();
        }
    }
    else {
        $("form")[0].reportValidity();
    }
}
//Hàm xử lý sự kiện nút xác nhận đơn hàng
function onBtnCreatOrderClick() {
    "use strict";
    var vCreateOrderObj = {
        kichCo: "",
        duongKinh: "",
        suon: "",
        salad: "",
        loaiPizza: "",
        idVourcher: "",
        idLoaiNuocUong: "",
        soLuongNuoc: "",
        hoTen: "",
        thanhTien: "",
        email: "",
        soDienThoai: "",
        diaChi: "",
        loiNhan: ""
    }
    //B1: Lấy dữ liệu vào order object
    getDataToCreateOrderObj(vCreateOrderObj);
    //B2: validate (ko cần)
    //B3: call api
    $.ajax({
        url: "http://42.115.221.44:8080/devcamp-pizza365/orders",
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify(vCreateOrderObj),
        //B4: process request
        success: confirmOrder,
        error: function (ajaxContext) {
            alert(ajaxContext.responseText)
        }
    });
}
/*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/

//Hàm lấy dữ liệu drink menu
function getDrinkList() {
    "use strict";
    $.ajax({
        url: "http://42.115.221.44:8080/devcamp-pizza365/drinks",
        type: "GET",
        dataType: "json",
        success: loadDrinkListToSelectDrink,
        error: function (ajaxContext) {
            alert(ajaxContext.responseText)
        }
    });
}
//hàm đổ dữ liệu drink list về select drink
function loadDrinkListToSelectDrink(paramRes) {
    "use strict";
    gDrinkData = paramRes;
    for (var bIndex = 0; bIndex < gDrinkData.length; bIndex++) {
        var bDrink = $("<option>").appendTo("#select-drink");
        bDrink.val(gDrinkData[bIndex].maNuocUong);
        bDrink.text(gDrinkData[bIndex].tenNuocUong);
    }
}
//hàm thu thập thông tin người dùng nhập trên form
function getPersonData() {
    "use strict";
    gPersonData.fullName = $("#inp-fullname").val().trim();
    gPersonData.email = $("#inp-email").val().trim();
    gPersonData.phoneNumber = $("#inp-dien-thoai").val().trim();
    gPersonData.address = $("#inp-dia-chi").val().trim();
    gPersonData.message = $("#inp-message").val().trim();
    gPersonData.voucher = $("#inp-voucher").val().trim();
    gPersonData.drink = $("#select-drink").val();
}
// hàm dùng để kiểm tra giá trị đầu vào
// return true nếu toàn bộ dữ liệu hợp lệ
// return false nếu có 1 dữ liệu ko hợp lệ
function validateFormData() {
    "use strict";
    //check chọn loại combo
    if (gSelectedMenuStructure.menuName == "...") {
        alert("Hãy chọn Combo Pizza!");
        $(".btn-select-pizza-combo")[0].scrollIntoView(false);//di chuyển trang về vị trí nút chọn
        return false;
    }
    //check chọn loại pizza
    if (gSelectedPizzaType.value == "") {
        alert("Hãy chọn loại Pizza!");
        $(".btn-select-pizza-type")[0].scrollIntoView(false);//di chuyển trang về vị trí nút chọn
        return false;
    }
    //check chọn loại đồ uống
    if (gPersonData.drink == "none") {
        alert("Hãy chọn đồ uống!");
        $("#drink-menu")[0].scrollIntoView(true);//di chuyển trang về vị trí nút chọn
        return false;
    }
    return true;
}
//hàm ghi dữ liệu ra vùng ẩn để xác nhận đơn hàng
function showModalOrderDetail() {
    "use strict";
    var vDrink = getDrinkbyDrinkCode(gPersonData.drink);//biến mảng thông tin đồ uống đã chọn

    $("#sp-ho-ten").html(gPersonData.fullName);
    $("#sp-email").html(gPersonData.email);
    $("#sp-so-dien-thoai").html(gPersonData.phoneNumber);
    $("#sp-dia-chi").html(gPersonData.address);
    $("#sp-loi-nhan").html(gPersonData.message);
    $("#sp-combo-size").html(gSelectedMenuStructure.menuName);
    $("#sp-duong-kinh").html(gSelectedMenuStructure.duongKinhCM);
    $("#sp-suon-nuong").html(gSelectedMenuStructure.suonNuong);
    $("#sp-salad").html(gSelectedMenuStructure.saladGr);
    $("#sp-so-luong-nuoc-uong").html(gSelectedMenuStructure.drink);
    $("#sp-loai-pizza").html(gSelectedPizzaType.text);
    $("#sp-drink").html(vDrink.tenNuocUong);
    $("#sp-voucher-id").html(gPersonData.voucher);
    $("#sp-thanh-tien").html(gSelectedMenuStructure.priceVND.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }));
    $("#sp-giam-gia").html(getVoucherByVoucherCode(gPersonData.voucher) + "%");
    $("#sp-thanh-toan").html(payPrice().toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }));

    //Hiển thị Modal
    $("#modal-detail-order").modal("show");
}
//Hàm lấy object Drink về theo value select đồ uống đã chọn
function getDrinkbyDrinkCode(paramDrinkCode) {
    "use strict";
    //debugger;
    var vCodeFound = false; //biến cờ
    var vDrinkResult = null; //biến lưu giá trị object trả về
    var vIndex = 0;// biến trỏ
    //kiểm tra chừng nào cờ vẫn còn false và giá trị trỏ nhỏ hơn số phần tử mảng 
    while (!vCodeFound && vIndex < gDrinkData.length) {
        //so sánh mã nước uống trong mảng với value đồ uống đang select
        if (gDrinkData[vIndex].maNuocUong == paramDrinkCode) {
            //điều kiện đúng, thay cờ và lấy mảng về biến lưu giá trị
            vCodeFound = true;
            vDrinkResult = gDrinkData[vIndex];
        }
        else {
            //điều kiện sai, tăng giá trị biến trỏ
            vIndex++;
        }
    }
    return vDrinkResult;
}
//hàm tính số tiền phải thanh toán
function payPrice() {
    "use strict";
    var vDiscount = getVoucherByVoucherCode(gPersonData.voucher);
    var vTotal = gSelectedMenuStructure.priceVND;
    var vPay = vTotal - vTotal * vDiscount / 100;
    return vPay;
}
//Hàm lấy voucher theo code đã nhập: gọi API để kiểm tra hợp lệ và trả về % giảm giá
/*
  Code test:
{"id":02,"maVoucher":"12354","phanTramGiamGia":"10","ghiChu":null,"ngayTao":1614361849000,"ngayCapNhat":1614361849000}
{"id":20,"maVoucher":"26491","phanTramGiamGia":"20","ghiChu":null,"ngayTao":1614361849000,"ngayCapNhat":1614361849000}
{"id":28,"maVoucher":"35468","phanTramGiamGia":"30","ghiChu":null,"ngayTao":1614361849000,"ngayCapNhat":1614361849000}
{"id":30,"maVoucher":"96462","phanTramGiamGia":"40","ghiChu":null,"ngayTao":1614361849000,"ngayCapNhat":1614361849000}
{"id":50,"maVoucher":"10056","phanTramGiamGia":"50","ghiChu":null,"ngayTao":1614361849000,"ngayCapNhat":1614361849000}
*/
function getVoucherByVoucherCode(paramVoucherCode) {
    "use strict";
    //debugger;
    var vVoucherDisscount = null;
    if (paramVoucherCode != "") {
        $.ajax({
            async: false,
            url: "http://42.115.221.44:8080/devcamp-voucher-api/voucher_detail/" + paramVoucherCode,
            type: "GET",
            dataType: "json",
            success: function (voucherResponse) {
                vVoucherDisscount = voucherResponse.phanTramGiamGia;
            },
            error: function (ajaxContext) {
                alert("mã giảm giá không tồn tại");
                vVoucherDisscount = 0;
            }
        });
    }
    else {
        vVoucherDisscount = 0;
    }
    return vVoucherDisscount;
}
//Hàm ấy dữ liệu vào order object
function getDataToCreateOrderObj(paramCreateOrderObj) {
    "use strict";
    paramCreateOrderObj.kichCo = gSelectedMenuStructure.menuName;
    paramCreateOrderObj.duongKinh = gSelectedMenuStructure.duongKinhCM;
    paramCreateOrderObj.suon = gSelectedMenuStructure.suonNuong;
    paramCreateOrderObj.salad = gSelectedMenuStructure.saladGr;
    paramCreateOrderObj.loaiPizza = gSelectedPizzaType.value;
    paramCreateOrderObj.idVourcher = gPersonData.voucher;
    paramCreateOrderObj.idLoaiNuocUong = gPersonData.drink;
    paramCreateOrderObj.soLuongNuoc = gSelectedMenuStructure.drink;
    paramCreateOrderObj.hoTen = gPersonData.fullName;
    paramCreateOrderObj.thanhTien = gSelectedMenuStructure.priceVND;
    paramCreateOrderObj.email = gPersonData.email;
    paramCreateOrderObj.soDienThoai = gPersonData.phoneNumber;
    paramCreateOrderObj.diaChi = gPersonData.address;
    paramCreateOrderObj.loiNhan = gPersonData.message;
}
//Hàm xác nhận Order: Ẩn phần Xác nhận đơn hàng đi, và hiển thị phần Cảm ơn kèm Mã đơn hàng bên dưới
function confirmOrder(paramCreatedOrderResponse) {
    "use strict";
    gOrderResponseObj = paramCreatedOrderResponse;
    var vOrderId = gOrderResponseObj.orderId;
    //Ẩn modal Xác nhận đơn hàng
    $("#modal-detail-order").modal("hide");
    //hiển thị modal Cảm ơn kèm Mã đơn hàng
    $("#inp-order-id").val(vOrderId);
    $("#modal-confirm-order").modal("show");
}
//hàm sự kiện click theo dõi đơn hàng
function callDropdownOrderId() {
    "use strict";
    if (gOrderResponseObj.orderId == undefined) {
        $("#inp-modal-order-id").val("");
    }
    else {
        $("#inp-modal-order-id").val(gOrderResponseObj.orderId);
    }
    $("#btn-go-view-order").click(function () {
        callViewOrderPage($("#inp-modal-order-id").val());
    })
}
//Hàm truyền id và orderId của đơn hàng vừa tạo sang trang viewOrder
function callViewOrderPage(paramInpModalOrderId) {
    "use strict";
    //gọi và truyền data sang trang viewOrder
    const vDETAIL_FORM_URL = "./html/viewOrder.html"
    var vUrlSiteToOpen = vDETAIL_FORM_URL + "?orderid=" + paramInpModalOrderId;
    //window.open(vUrlSiteToOpen);
    window.location.href = vUrlSiteToOpen;
}