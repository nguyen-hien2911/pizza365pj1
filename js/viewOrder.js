"use strict";
/*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
var gId = "";
var gOrderId = "";
var gDrinkData = {};
/*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */

/*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
$(document).ready(function () {

    //load dữ liệu danh sách đồ uống lấy từ API khi tải trang
    getDrinkList();
    //Hàm load dữ liệu lên form từ query string
    loadDataByQueryString();
    //sự kiện thay đổi select combo size
    $(document).on("change", "#select-combo-size", function () {
        onSelectComboSizeChange();
        onInpVoucherChange();
    });
    //sự kiện thay đổi voucher id
    $(document).on("change", "#inp-voucher-id", function () {
        onInpVoucherChange();
    });
    //sự kiện click nút update
    $(document).on("click", "#btn-update", function (event) {
        event.preventDefault();
        onBtnUpdateClick();
    });
});
//Hàm xử lý sự kiện khi select combo size change
function onSelectComboSizeChange() {
    "use strict";
    var vSelectComboVal = $("#select-combo-size").val();
    switch (vSelectComboVal) {
        case "S":
            $("#inp-duong-kinh").val("20cm");
            $("#inp-suon-nuong").val(2);
            $("#inp-salad").val("200g");
            $("#inp-thanh-tien").val(150000);
            $("#inp-so-luong-nuoc-uong").val(2);
            break;
        case "M":
            $("#inp-duong-kinh").val("25cm");
            $("#inp-suon-nuong").val(4);
            $("#inp-salad").val("300g");
            $("#inp-thanh-tien").val(200000);
            $("#inp-so-luong-nuoc-uong").val(3);
            break;
        case "L":
            $("#inp-duong-kinh").val("30cm");
            $("#inp-suon-nuong").val(8);
            $("#inp-salad").val("500g");
            $("#inp-thanh-tien").val(250000);
            $("#inp-so-luong-nuoc-uong").val(4);
            break;
    }
}
//Hàm xử lý sự kiện khi thay đổi voucher id
function onInpVoucherChange() {
    "use strict";
    var vVoucherId = $("#inp-voucher-id").val().trim();
    var vDiscount = null;
    getVoucherByVoucherId(vVoucherId, vDiscount);
}
//hàm xử lý sư kiện click nút update
function onBtnUpdateClick() {
    "use strict";
    var vFormDataObj = {
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
        loiNhan: "",
        giamGia: "",
    };
    //1: thu thập dữ liệu
    getDataOnForm(vFormDataObj);
    //2: validate
    if ($("form")[0].checkValidity()) {
        var vIsValidate = getValidateFormData(vFormDataObj);
        if (vIsValidate) {
            //B3: call api
            $.ajax({
                url: "http://42.115.221.44:8080/devcamp-pizza365/orders/" + gId,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(vFormDataObj),
                success: function (res) {
                    alert("Confirm done!");
                    //window.location.href = "OrderList.html";
                },
                error: function (ajaxContext) {
                    alert(ajaxContext.responseText);
                }
            })
        }
    }
    else {
        //Validate Form
        $("form")[0].reportValidity();
    }
    //4: process response
}
/*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
//Hàm lấy dữ liệu drink menu
function getDrinkList() {
    "use strict";
    $.ajax({
        async: false,
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
//Hàm load dữ liệu lên form từ query string
function loadDataByQueryString() {
    "use strict";
    //B1: lấy dữ liệu ID (query string)
    getQueryString(); // lấy giá trị query string
    //B2: validate dữ liệu (xem ID có trên querystring không?)
    var isValidate = validateIdQueryString();
    if (isValidate) {
        //B3: call API
        $.ajax({
            url: "http://42.115.221.44:8080/devcamp-pizza365/orders/" + gOrderId,
            type: 'GET',
            dataType: 'json', // added data type
            success: function (res) {
                //B4: process response
                gId = res.id;
                showDataOnForm(res);
            },
            error: function (ajaxContext) {
                alert(ajaxContext.responseText)
            }
        });
    }
}
//Hàm lấy Id từ query string
function getQueryString() {
    "use strict";
    var vUrlString = window.location.href;
    var vUrl = new URL(vUrlString);
    //gId = vUrl.searchParams.get('id');
    gOrderId = vUrl.searchParams.get('orderid');
}
//Hàm validate dữ liệu querystring
function validateIdQueryString() {
    "use strict";
    if (gOrderId == null || gOrderId == "") {
        alert("Chưa có Order Id! Quay lại trang chủ đặt hàng!");
        window.location.href = "../pizza365index.html";
        return false;
    }
    return true;
}
//Hàm hiển thị dữ liệu user lên form
function showDataOnForm(paramRes) {
    "use strict";

    $('#inp-order-id').val(gOrderId);
    $('#select-combo-size').val(paramRes.kichCo.toUpperCase());
    $('#inp-duong-kinh').val(paramRes.duongKinh);
    $('#inp-suon-nuong').val(paramRes.suon);
    for (var bI = 0; bI < $('#select-drink')[0].options.length; bI++) {
        if ($('#select-drink')[0].options[bI].value === paramRes.idLoaiNuocUong) {
            $('#select-drink').val(paramRes.idLoaiNuocUong);
        }
    }
    $('#inp-so-luong-nuoc-uong').val(paramRes.soLuongNuoc);
    $('#inp-voucher-id').val(paramRes.idVourcher);
    $('#select-loai-pizza').val(paramRes.loaiPizza.toLowerCase());
    $('#inp-salad').val(paramRes.salad);
    $('#inp-thanh-tien').val(paramRes.thanhTien);
    $('#inp-giam-gia').val(paramRes.giamGia);
    $('#inp-ho-ten').val(paramRes.hoTen);
    $('#inp-email').val(paramRes.email);
    $('#inp-so-dien-thoai').val(paramRes.soDienThoai);
    $('#inp-dia-chi').val(paramRes.diaChi);
    $('#inp-loi-nhan').val(paramRes.loiNhan);
    $('#inp-trang-thai').val(paramRes.trangThai);
    $('#inp-ngay-tao').val(new Date(paramRes.ngayTao));
    $('#inp-ngay-cap-nhat').val(new Date(paramRes.ngayCapNhat));
}
//Hàm lấy voucher theo ID
function getVoucherByVoucherId(paramVoucherId, paramDiscount) {
    "use strict";
    $.ajax({
        async: false,
        url: "http://42.115.221.44:8080/devcamp-voucher-api/voucher_detail/" + paramVoucherId,
        type: "GET",
        dataType: "json",
        success: function (res) {
            paramDiscount = res.phanTramGiamGia;
        },
        error: function () {
            alert("Không tìm thấy mã giảm giá!");
            paramDiscount = 0;
        }
    })
    var vGiamGia = $("#inp-thanh-tien").val() * paramDiscount / 100;
    $("#inp-giam-gia").val(vGiamGia);
}
//Hàm lấy dữ liệu trên form
function getDataOnForm(paramFormDataObj) {
    "use strict";
    paramFormDataObj.kichCo = $("#select-combo-size").val();
    paramFormDataObj.duongKinh = $("#inp-duong-kinh").val();
    paramFormDataObj.suon = $("#inp-suon-nuong").val();
    paramFormDataObj.salad = $("#inp-salad").val();
    paramFormDataObj.loaiPizza = $("#select-loai-pizza").val();
    paramFormDataObj.idVourcher = $("#inp-voucher-id").val().trim();
    paramFormDataObj.idLoaiNuocUong = $("#select-drink").val();
    paramFormDataObj.soLuongNuoc = $("#inp-so-luong-nuoc-uong").val();
    paramFormDataObj.hoTen = $("#inp-ho-ten").val().trim();
    paramFormDataObj.thanhTien = $("#inp-thanh-tien").val();
    paramFormDataObj.email = $("#inp-email").val().trim();
    paramFormDataObj.soDienThoai = $("#inp-so-dien-thoai").val().trim();
    paramFormDataObj.diaChi = $("#inp-dia-chi").val().trim();
    paramFormDataObj.loiNhan = $("#inp-loi-nhan").val().trim();
    paramFormDataObj.giamGia = $("#inp-giam-gia").val();
}
//hàm validate dữ liệu nhập trên form
function getValidateFormData(paramFormDataObj) {
    "use strict";
    if (paramFormDataObj.idLoaiNuocUong == "none") {
        alert("Hãy chọn loại nước uống!");
        return false;
    }
    if (paramFormDataObj.kichCo == "none") {
        alert("Hãy chọn kích cỡ combo!");
        return false;
    }
    if (paramFormDataObj.loaiPizza == "none") {
        alert("Hãy chọn loại pizza!");
        return false;
    }
    return true;
}