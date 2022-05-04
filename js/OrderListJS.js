$(document).ready(function () {
  "use strict";
  var Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
  });
  /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
  var gPizzaType = [
    {
      "value": "Seafood",
      "text": "Hải sản"
    },
    {
      "value": "Hawaii",
      "text": "Hawaii"
    },
    {
      "value": "Bacon",
      "text": "Thịt hun khói"
    },
  ];
  var gStatus = [
    {
      "value": "open",
      "text": "Open"
    },
    {
      "value": "cancel",
      "text": "Đã hủy"
    },
    {
      "value": "confirmed",
      "text": "Đã xác nhận"
    },
  ];
  var gId = "";
  var gOrderId = "";
  var gDrinkData = {};
  // định nghĩa table  - chưa có data
  const gDATA_COLUMN = ["orderId", "kichCo", "loaiPizza", "idLoaiNuocUong", "thanhTien", "hoTen", "soDienThoai", "trangThai", "action"];
  const gORDER_ID_COLS = 0;
  const gKICH_CO_COLS = 1;
  const gLOAI_PIZZA_COLS = 2;
  const gNUOC_UONG_COLS = 3;
  const gTHANH_TIEN_COLS = 4;
  const gHO_TEN_COLS = 5;
  const gSDT_COLS = 6;
  const gTRANG_THAI_COLS = 7;
  const gACTION_COLS = 8;
  var gOrderListTable = $("#table-order").DataTable({
    columns: [
      { data: gDATA_COLUMN[gORDER_ID_COLS] },
      { data: gDATA_COLUMN[gKICH_CO_COLS] },
      { data: gDATA_COLUMN[gLOAI_PIZZA_COLS] },
      { data: gDATA_COLUMN[gNUOC_UONG_COLS] },
      { data: gDATA_COLUMN[gTHANH_TIEN_COLS] },
      { data: gDATA_COLUMN[gHO_TEN_COLS] },
      { data: gDATA_COLUMN[gSDT_COLS] },
      { data: gDATA_COLUMN[gTRANG_THAI_COLS] },
      { data: gDATA_COLUMN[gACTION_COLS] },
    ],
    columnDefs: [
      {
        targets: gACTION_COLS,
        className: "text-center",
        defaultContent: `
            <i class="fas fa-edit fa-lg text-primary btn-update-order" style="cursor: pointer;" title="Update Order" data-toggle='modal' data-target='#modal-update-order'></i>
            &ensp;
            <i class="fas fa-trash-alt fa-lg text-danger btn-delete-order" style="cursor: pointer;" title="Delete Order" data-toggle='modal' data-target='#modal-delete-order'></i>
        `
      },
      {
        targets: gTRANG_THAI_COLS,
        className: "text-center",
        render: function (data) {
          var vStatus = "";
          for (var bI = 0; bI < gStatus.length; bI++) {
            if (data.toLowerCase() == gStatus[bI].value) {
              vStatus = gStatus[bI].text;
            }
          }
          return vStatus;
        }
      },
    ],
    autoWidth: false,
  });
  //đóng gói data + method cho mảng Order
  var gOrderDb = {
    orders: [],
    filterOrder: function (filterData) {
      var vOrderFilterData = [];
      vOrderFilterData = this.orders.filter(function (orderData) {
        return (
          (filterData.loaiPizza === "none" || orderData.loaiPizza.toLowerCase().includes(filterData.loaiPizza.toLowerCase())) &&
          (filterData.trangThai === "none" || orderData.trangThai.toLowerCase() == filterData.trangThai)
        )
      });
      return vOrderFilterData;
    },
  }

  /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
  onPageLoading();
  //sự kiện click
  //gán event handler click cho button filter
  $(document).on("click", "#btn-filter-order", function () {
    onBtnFilterClick();
  })
  //gán event handler click cho button delete order
  $(document).on("click", ".btn-delete-order", function () {
    onBtnDeleteClick(this);
  })
  //gán event handler click cho button update order
  $(document).on("click", ".btn-update-order", function () {
    onBtnUpdateClick(this);
  })
  //gán event handler click cho button add order (modal add)
  $(document).on("click", "#modal-add-btn-add-order", function () {
    onBtnAddOrderClick();
  })
  //gán event handler click cho button update order (modal update)
  $(document).on("click", "#modal-update-btn-update-order", function () {
    onBtnUpdateOrderClick();
  })
  //gán event handler click cho button confirm delete order (modal delete)
  $(document).on("click", "#modal-delete-btn-delete-order", function () {
    onBtnConfirmDeleteOrderClick();
  })

  //Sự kiện change
  //sự kiện thay đổi select combo size modal add
  $(document).on("change", "#modal-add-select-combo-size", function () {
    onModalAddSelectComboSizeChange();
    onModalAddInpVoucherChange();
  });
  //sự kiện thay đổi voucher id modal add
  $(document).on("change", "#modal-add-inp-voucher-id", function () {
    onModalAddInpVoucherChange();
  });


  /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
  function onPageLoading() {
    "use strict";
    //load select filter
    loadSelect();
    // lấy list order từ server
    getOrderListApi();
    //lấy drink list
    getDrinkList();
  }
  //hàm xử lý sự kiện click nút filter order
  function onBtnFilterClick() {
    "use strict";
    var vFilterObj = {
      trangThai: "",
      loaiPizza: "",
    };
    //B1: thu thập dữ liệu
    getFilterData(vFilterObj);
    //B2: kiểm tra dữ liệu (bỏ qua)
    //B3: Xử lý và hiển thị kết quả
    filterUserData(vFilterObj);
  }
  //hàm xử lý sự kiện click delete order
  function onBtnDeleteClick(paramButton) {
    "use strict";
    //Xác định thẻ tr là cha của nút được chọn
    var vRowSelected = $(paramButton).closest('tr');
    //Lấy datatable row
    var vDatatableRow = gOrderListTable.row(vRowSelected);
    //Lấy data của dòng 
    var vOrderData = vDatatableRow.data();
    gId = vOrderData.id;
    gOrderId = vOrderData.orderId;
  }
  //hàm xử lý sự kiện click update order
  function onBtnUpdateClick(paramButton) {
    "use strict";
    //Xác định thẻ tr là cha của nút được chọn
    var vRowSelected = $(paramButton).closest('tr');
    //Lấy datatable row
    var vDatatableRow = gOrderListTable.row(vRowSelected);
    //Lấy data của dòng 
    var vOrderData = vDatatableRow.data();
    gId = vOrderData.id;
    gOrderId = vOrderData.orderId;
    showDataFormUpdateOrder(vOrderData);
  }
  //hàm xử lý sự kiện click add order (modal)
  function onBtnAddOrderClick() {
    "use strict";
    //0: khởi tạo biến
    var vAddOrderObj = {
      diaChi: "",
      duongKinh: "",
      email: "",
      giamGia: "",
      hoTen: "",
      idLoaiNuocUong: "",
      idVourcher: "",
      kichCo: "",
      loaiPizza: "",
      loiNhan: "",
      salad: "",
      soDienThoai: "",
      soLuongNuoc: "",
      suon: "",
      thanhTien: "",
    }
    //1: thu thập dữ liệu
    getDataOnFormAddOrder(vAddOrderObj);
    //2: validate
    if ($("form")[0].checkValidity()) {
      var vIsValided = validateFormAddOrder(vAddOrderObj);
      if (vIsValided) {
        //3: call api
        $.ajax({
          url: "http://42.115.221.44:8080/devcamp-pizza365/orders",
          type: "POST",
          contentType: 'application/json',
          data: JSON.stringify(vAddOrderObj),
          //B4: process request
          success: function (res) {
            //alert("Đã tạo đơn hàng thành công order! Mã Order: " + res.orderId);
            $(document).Toasts('create', {
              class: 'bg-success',
              title: 'Thành công',
              body: 'Đã tạo đơn hàng thành công. Mã đơn hàng (OrderID): ' + res.orderId,
            })
            //reset modal
            resetModalAdd();
            //close modal
            $("#modal-add-order").modal("hide");
            //load lại bảng
            getOrderListApi();
          },
          error: function (ajaxContext) {
            Toast.fire({
              icon: 'error',
              title: ajaxContext.responseText,
            });
          }
        });
      }
    }
    else {
      $("form")[0].reportValidity();
    }
  }
  //hàm xử lý sự kiện click update order (modal)
  function onBtnUpdateOrderClick() {
    "use strict";
    var vObjectRequest = {
      trangThai: ""
    }
    //1:thu thập dữ liệu
    vObjectRequest.trangThai = $("#modal-update-select-trang-thai").val();
    //2: validate
    if (vObjectRequest.trangThai == "none") {
      Toast.fire({
        icon: 'error',
        title: 'Hãy chọn trạng thái đơn hàng!'
      })
    }
    else {
      //3: call api
      $.ajax({
        url: "http://42.115.221.44:8080/devcamp-pizza365/orders/" + gId,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(vObjectRequest),
        success: function (res) {
          //4: process responce
          Toast.fire({
            icon: 'success',
            title: 'Đã cập nhật đơn hàng thành công!'
          });
          //close modal
          $("#modal-update-order").modal("hide");
          //load lại bảng
          getOrderListApi();
        },
        error: function (ajaxContext) {
          Toast.fire({
            icon: 'error',
            title: ajaxContext.responseText,
          });
        }
      });
    }
  }
  //hàm xử lý sự kiện click delete order (modal)
  function onBtnConfirmDeleteOrderClick() {
    "use strict";
    //1: thu thập dữ liệu (ko)
    //2: validate (ko)
    //3: call api
    $.ajax({
      async: false,
      url: "http://42.115.221.44:8080/devcamp-pizza365/orders/" + gId,
      type: "DELETE",
      success: function (res) {
        //4: process responce
        Toast.fire({
          icon: 'success',
          title: 'Đã xóa đơn hàng thành công!'
        });
        //close modal
        $("#modal-delete-order").modal("hide");
        //load lại bảng
        getOrderListApi();
      },
      error: function (error) {
        Toast.fire({
          icon: 'error',
          title: error.responseText,
        });
      }
    });
  }

  //Hàm xử lý sự kiện khi select combo size change (modal add)
  function onModalAddSelectComboSizeChange() {
    "use strict";
    var vSelectComboVal = $("#modal-add-select-combo-size").val();
    switch (vSelectComboVal) {
      case "S":
        $("#modal-add-inp-duong-kinh").val("20cm");
        $("#modal-add-inp-suon-nuong").val(2);
        $("#modal-add-inp-salad").val("200g");
        $("#modal-add-inp-thanh-tien").val(150000);
        $("#modal-add-inp-so-luong-nuoc-uong").val(2);
        break;
      case "M":
        $("#modal-add-inp-duong-kinh").val("25cm");
        $("#modal-add-inp-suon-nuong").val(4);
        $("#modal-add-inp-salad").val("300g");
        $("#modal-add-inp-thanh-tien").val(200000);
        $("#modal-add-inp-so-luong-nuoc-uong").val(3);
        break;
      case "L":
        $("#modal-add-inp-duong-kinh").val("30cm");
        $("#modal-add-inp-suon-nuong").val(8);
        $("#modal-add-inp-salad").val("500g");
        $("#modal-add-inp-thanh-tien").val(250000);
        $("#modal-add-inp-so-luong-nuoc-uong").val(4);
        break;
      case "none":
        $("#modal-add-inp-duong-kinh").val("");
        $("#modal-add-inp-suon-nuong").val("");
        $("#modal-add-inp-salad").val("");
        $("#modal-add-inp-thanh-tien").val("");
        $("#modal-add-inp-so-luong-nuoc-uong").val("");
        break;
    }
  }
  //Hàm xử lý sự kiện khi thay đổi voucher id modal add
  function onModalAddInpVoucherChange() {
    "use strict";
    var vVoucherId = $("#modal-add-inp-voucher-id").val().trim();
    if (vVoucherId == "") {
      var vDiscount = 0;
      $("#modal-add-inp-giam-gia").val(vDiscount);
      $("#modal-add-inp-thanh-toan").val($("#modal-add-inp-thanh-tien").val());
    }
    else {
      getVoucherByVoucherId(vVoucherId);
    }
  }

  /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
  //hàm load dữ liệu vào select trạng thái và select loại pizza
  function loadSelect() {
    "use strict";
    for (var bIndex = 0; bIndex < gPizzaType.length; bIndex++) {
      var bType = $("<option>").appendTo("#select-pizza-type");
      bType.val(gPizzaType[bIndex].value);
      bType.text(gPizzaType[bIndex].text);
      var bTypeAdd = $("<option>").appendTo("#modal-add-select-loai-pizza");
      bTypeAdd.val(gPizzaType[bIndex].value);
      bTypeAdd.text(gPizzaType[bIndex].text);
    }
    for (var bIndex = 0; bIndex < gStatus.length; bIndex++) {
      var bType = $("<option>").appendTo("#select-status");
      bType.val(gStatus[bIndex].value);
      bType.text(gStatus[bIndex].text);
      var bTypeUppdate = $("<option>").appendTo("#modal-update-select-trang-thai");
      bTypeUppdate.val(gStatus[bIndex].value);
      bTypeUppdate.text(gStatus[bIndex].text);
    }
  }
  //hàm lấy order từ api đổ về bảng
  function getOrderListApi() {
    "use strict";
    $.ajax({
      async: false,
      url: "http://42.115.221.44:8080/devcamp-pizza365/orders",
      type: "GET",
      dataType: "json",
      success: function (res) {
        gOrderDb.orders = res;
        loadDataToTable(gOrderDb.orders);
      },
      error: function (ajaxContext) {
        Toast.fire({
          icon: 'error',
          title: ajaxContext.responseText,
        });
      }
    });
  }
  // load data to table
  function loadDataToTable(paramTableDataArr) {
    "use strict";
    //Xóa toàn bộ dữ liệu đang có của bảng
    gOrderListTable.clear();
    //Cập nhật data cho bảng 
    gOrderListTable.rows.add(paramTableDataArr);
    //Cập nhật lại giao diện hiển thị bảng
    gOrderListTable.draw();
  }
  //hàm lấy dữ liệu filter
  function getFilterData(paramFilterObj) {
    "use strict";
    paramFilterObj.trangThai = $("#select-status").val();
    paramFilterObj.loaiPizza = $("#select-pizza-type").val();
  }
  //hàm lọc và hiển thị dữ liệu lọc
  function filterUserData(paramFilterObj) {
    "use strict";
    var vFilterArr = gOrderDb.filterOrder(paramFilterObj);
    loadDataToTable(vFilterArr);
  }
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
        Toast.fire({
          icon: 'error',
          title: ajaxContext.responseText,
        });
      }
    });
  }
  //hàm đổ dữ liệu drink list về select drink
  function loadDrinkListToSelectDrink(paramRes) {
    "use strict";
    gDrinkData = paramRes;
    for (var bIndex = 0; bIndex < gDrinkData.length; bIndex++) {
      var bDrinkModalAdd = $("<option>").appendTo("#modal-add-select-drink");
      bDrinkModalAdd.val(gDrinkData[bIndex].maNuocUong);
      bDrinkModalAdd.text(gDrinkData[bIndex].tenNuocUong);
      var bDrinkModalUpdate = $("<option>").appendTo("#modal-update-select-drink");
      bDrinkModalUpdate.val(gDrinkData[bIndex].maNuocUong);
      bDrinkModalUpdate.text(gDrinkData[bIndex].tenNuocUong);
    }
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
        Toast.fire({
          icon: 'warning',
          title: 'Không tìm thấy mã giảm giá!'
        })
        paramDiscount = 0;
      }
    })
    showDiscount(paramDiscount);
  }
  //Hàm hiển thị discount
  function showDiscount(paramDiscount) {
    "use strict";
    if (paramDiscount < 0 || paramDiscount > 100) {
      paramDiscount = 0;
    };
    var vGiamGiaAdd = $("#modal-add-inp-thanh-tien").val() * paramDiscount / 100;
    var vThanhToanAdd = $("#modal-add-inp-thanh-tien").val() - vGiamGiaAdd;
    $("#modal-add-inp-giam-gia").val(vGiamGiaAdd);
    $("#modal-add-inp-thanh-toan").val(vThanhToanAdd);
  }
  //hàm thu thập dữ liệu trên form modal add order
  function getDataOnFormAddOrder(paramAddOrderObj) {
    "use strict";
    paramAddOrderObj.diaChi = $("#modal-add-inp-dia-chi").val();
    paramAddOrderObj.duongKinh = $("#modal-add-inp-duong-kinh").val();
    paramAddOrderObj.email = $("#modal-add-inp-email").val();
    paramAddOrderObj.giamGia = $("#modal-add-inp-giam-gia").val();
    paramAddOrderObj.hoTen = $("#modal-add-inp-ho-ten").val();
    paramAddOrderObj.idLoaiNuocUong = $("#modal-add-select-drink").val();
    paramAddOrderObj.idVourcher = $("#modal-add-inp-voucher-id").val();
    paramAddOrderObj.kichCo = $("#modal-add-select-combo-size").val();
    paramAddOrderObj.loaiPizza = $("#modal-add-select-loai-pizza").val();
    paramAddOrderObj.loiNhan = $("#modal-add-inp-loi-nhan").val();
    paramAddOrderObj.salad = $("#modal-add-inp-salad").val();
    paramAddOrderObj.soDienThoai = $("#modal-add-inp-so-dien-thoai").val();
    paramAddOrderObj.soLuongNuoc = $("#modal-add-inp-so-luong-nuoc-uong").val();
    paramAddOrderObj.suon = $("#modal-add-inp-suon-nuong").val();
    paramAddOrderObj.thanhTien = $("#modal-add-inp-thanh-tien").val();
  }
  //hàm validate dữ liệu form modal add order
  function validateFormAddOrder(paramAddOrderObj) {
    "use strict";
    if (paramAddOrderObj.kichCo == "none") {
      Toast.fire({
        icon: 'error',
        title: 'Hãy chọn cỡ combo pizza!'
      });
      return false;
    }
    if (paramAddOrderObj.idLoaiNuocUong == "none") {
      Toast.fire({
        icon: 'error',
        title: 'Hãy chọn loại nước uống!'
      });
      return false;
    }
    if (paramAddOrderObj.loaiPizza == "none") {
      Toast.fire({
        icon: 'error',
        title: 'Hãy chọn loại pizza!'
      });
      return false;
    }

    return true;
  }
  //hàm reset modal add order
  function resetModalAdd() {
    "use strict";
    $("#modal-add-inp-dia-chi").val("");
    $("#modal-add-inp-duong-kinh").val("");
    $("#modal-add-inp-email").val("");
    $("#modal-add-inp-giam-gia").val("");
    $("#modal-add-inp-ho-ten").val("");
    $("#modal-add-select-drink").val("none");
    $("#modal-add-inp-voucher-id").val("");
    $("#modal-add-select-combo-size").val("none");
    $("#modal-add-select-loai-pizza").val("none");
    $("#modal-add-inp-loi-nhan").val("");
    $("#modal-add-inp-salad").val("");
    $("#modal-add-inp-so-dien-thoai").val("");
    $("#modal-add-inp-so-luong-nuoc-uong").val("");
    $("#modal-add-inp-suon-nuong").val("");
    $("#modal-add-inp-thanh-tien").val("");
  }
  //hàm hiển thị dữ liệu lên form modal update order
  function showDataFormUpdateOrder(paramOrderData) {
    "use strict";
    $("#modal-update-inp-ho-ten").val(paramOrderData.hoTen);
    $("#modal-update-inp-dia-chi").val(paramOrderData.diaChi);
    $("#modal-update-inp-so-dien-thoai").val(paramOrderData.soDienThoai);
    $("#modal-update-inp-email").val(paramOrderData.email);
    $("#modal-update-inp-loi-nhan").val(paramOrderData.loiNhan);

    $("#modal-update-inp-order-id").val(paramOrderData.orderId);
    $("#modal-update-inp-duong-kinh").val(paramOrderData.duongKinh);
    $("#modal-update-inp-suon-nuong").val(paramOrderData.suon);
    $("#modal-update-inp-salad").val(paramOrderData.salad);
    $("#modal-update-inp-so-luong-nuoc-uong").val(paramOrderData.soLuongNuoc);
    $("#modal-update-inp-loai-pizza").val(paramOrderData.loaiPizza);
    $("#modal-update-inp-thanh-tien").val(paramOrderData.thanhTien);
    $("#modal-update-inp-voucher-id").val(paramOrderData.idVourcher);
    $("#modal-update-inp-giam-gia").val(paramOrderData.giamGia);
    $("#modal-update-inp-ngay-tao").val(new Date(paramOrderData.ngayTao));
    $("#modal-update-inp-ngay-cap-nhat").val(new Date(paramOrderData.ngayCapNhat));

    $("#modal-update-select-combo-size").val(paramOrderData.kichCo.toUpperCase());
    $("#modal-update-select-trang-thai").val(paramOrderData.trangThai);
    $("#modal-update-select-drink").val(paramOrderData.idLoaiNuocUong);
  }
})