var dappAddress = "n1jxW6mRZeGkAuNj44sQjAHJ45zHSoHVj8J";
var netbase = "https://testnet.nebulas.io";
var nebulas = require("nebulas"),
        Account = nebulas.Account,
        neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest(netbase));
var from = Account.NewAccount().getAddressString();

window.onload = function () {
  if (typeof webExtensionWallet === "undefined") {
    $("#noExtension").attr("style", "display:block;");
    $("#submitbutton").attr("disabled", true);
  } else {
    $("#submitbutton").attr("disabled", false);
  }
};

function timestampToTime(timestamp) {
  var date = new Date(timestamp);
  var seperator1 = "/";
  var seperator2 = ":";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var h = date.getHours();
  var m = date.getMinutes();
  var s = date.getSeconds();
  if (s == "0") {
    s = "00";
  }
  var currentdate =
    year +
    seperator1 +
    month +
    seperator1 +
    strDate +
    " " +
    h +
    seperator2 +
    m +
    seperator2 +
    s;
  return currentdate;
};

function readFile() {
  var max_size = 3 * 1024;
  var file = this.files[0];
  var size = file.size;
  if (!/image\/\w+/.test(file.type)) {
    alert("image only please.");
    return false;
  }
  if (size > max_size * 1024) {
    alert("图片大小不能超过3M!");
    $("#InputFile").val("");
    img_area.innerHTML = "";
    return false;
  }
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (e) {
    var img = new Image();

    img.src = this.result;
    img_area.innerHTML = "";
    img_area.innerHTML =
      '<div class="sitetip">预览：</div><img id="pre_picture" src="' +
      img.src +
      '" alt=""/>';
  };
};

function getComments(id) {
  var value = "0";
  var nonce = "0";
  var gas_price = "1000000";
  var gas_limit = "2000000";
  var to = dappAddress;
  var value = "0";
  var callFunction = "getCommentsById";
  var callArgs = [];
  callArgs.push(id);
  var contract = {
    function: callFunction,
    args: JSON.stringify(callArgs)
  };
  neb.api
    .call(from, dappAddress, value, nonce, gas_price, gas_limit, contract)
    .then(function (resp) {
      commentShow(resp);
    })
    .catch(function (err) {
      //cbSearch(err)
      console.log("error:" + err.message);
    });
};

function getPublishingBlog() {
  var value = "0";
  var nonce = "0";
  var gas_price = "1000000";
  var gas_limit = "2000000";
  var to = dappAddress;
  var value = "0";
  var callFunction = "getTopLine";
  var callArgs = [];
  var contract = {
    function: callFunction,
    args: JSON.stringify(callArgs)
  };
  neb.api
    .call(from, to, value, nonce, gas_price, gas_limit, contract)
    .then(function (resp) {
      BlogShow(resp);
    });
  // .catch(function(err) {
  //   //cbSearch(err)
  //   console.log("error:" + err);
  // });
}

var BlogShow = function (resp) {
  var result = resp.result;
  result = JSON.parse(result);
  var topLine = "";
  if (result.length > 0) {
    $("#clicklike").css("pointer-events", "auto");
    $("#submitcomment").removeAttr("disabled");
    if (result.length == 1) {
      topLine = result[0];
    } else if (result.length == 2) {
      if (result[0].expiredTime < result[1].expiredTime) {
        topLine = result[0];
        $("#nexttopline").text(
          "我要上头条：下一头条已被" + result[1].author + "抢占！"
        );
      } else {
        topLine = result[1];
        $("#nexttopline").text(
          "我要上头条：下一头条已被" + result[0].author + "抢占！"
        );
      }
    }
    var expiredTime = topLine.expiredTime;
    var id = topLine.id;
    var title = topLine.title;
    var content = topLine.content;
    var picture = topLine.picture;
    var publishTime = topLine.publishTime;
    var author = topLine.author;
    var like = topLine.like;
    $("#titleheader").text(title);
    $("#picShow").attr("src", picture);
    $("#picShowHref").attr("href", picture);
    $("#wordcontent").text(content);
    $("#author").text(author);
    $("#like").text(like);
    $("#toplineid").text(id);
    $.leftTime(timestampToTime(expiredTime), function (d) {
      if (d.status) {
        var $dateShow1 = $("#dateShow1");
        $dateShow1.find(".d").html(d.d);
        $dateShow1.find(".h").html(d.h);
        $dateShow1.find(".m").html(d.m);
        $dateShow1.find(".s").html(d.s);
      } else {
        window.location.reload();
      }
    });
    getComments(id);
    console.log(
      "id:" +
      id +
      "  title:" +
      title +
      "  content:" +
      content +
      "    publishTime:" +
      publishTime +
      "    expiredTime:" +
      expiredTime +
      "   now:" +
      Date.parse(new Date()) +
      "  author:" +
      author +
      "  like:" +
      like +
      "picture:"
      // picture
    );
  }
};

function like(id) {
  var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
  var nebPay = new NebPay();
  var value = "0";
  var nonce = "0";
  var gas_price = "1000000";
  var gas_limit = "2000000";
  var to = dappAddress;
  var value = "0";
  var callFunction = "like";
  var callArgs = [];
  callArgs.push(id);
  console.log("id:" + id);
  nebPay.call(to, value, callFunction, JSON.stringify(callArgs), {
    //使用nebpay的call接口去调用合约,
    // listener: cbPush
  });
};

function comment(id, content) {
  var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
  var nebPay = new NebPay();
  var value = "0";
  var nonce = "0";
  var gas_price = "1000000";
  var gas_limit = "2000000";
  var to = dappAddress;
  var value = "0";
  var callFunction = "comment";
  var callArgs = [];
  callArgs.push(id);
  callArgs.push(content);
  console.log("id:" + id + "  comment:" + content);
  $("#submitcomment").val("提交中...");
  $("#submitcomment").attr("disabled", true);
  nebPay.call(to, value, callFunction, JSON.stringify(callArgs), {
    //使用nebpay的call接口去调用合约,
    listener: commentResult
  });
  function commentResult(resp) {
    $("#submitcomment").val("提交评论");
    $("#submitcomment").attr("disabled", false);
  }
}
$(function () {
  $("#clicklike").css("pointer-events", "none");
  getPublishingBlog();
  $("#publish").click(function () {
    $("#inputTitle").val("");
    $("#inputContent").val("");
    $("#InputFile").val("");
    $("#img_area").text("");
    $("#menuheader").attr("style", "display:none;");
    $("#myModal").modal("show");
  });
  $("#operate").click(function () {
    $("#menuheader").attr("style", "display:none;");
    $("#operateModal").modal("show");
  });
  $("#about").click(function () {
    $("#menuheader").attr("style", "display:none;");
    $("#aboutModal").modal("show");
  });
  $("#myModal").on("hide.bs.modal", function () {
    $("#menuheader").attr("style", "display:block;");
  });
  $("#operateModal").on("hide.bs.modal", function () {
    $("#menuheader").attr("style", "display:block;");
  });
  $("#aboutModal").on("hide.bs.modal", function () {
    $("#menuheader").attr("style", "display:block;");
  });

  $("#clicklike").click(function () {
    $("#showlike").attr("style", "color:red");
    var id = $("#toplineid").text();
    like(id);
  });
  $("#submitcomment").click(function () {
    var id = $("#toplineid").text();
    var content = $("#inputComment").val();
    if (!content.length) {
      alert("评论不能为空！");
    } else {
      comment(id, content);
    }
  });
  $("#toutiao_form").validate({
    debug: true,
    rules: {
      inputTitle: {
        required: true,
        maxlength: 15
      },

      inputContent: "required",
      InputFile: "required"
    },
    messages: {
      inputTitle: {
        required: "标题不能为空！",
        maxlength: "标题不可超过15个字符"
      },
      inputContent: "内容不能为空！",
      InputFile: "封面不能为空！"
    },
    errorElement: "span",
    errorPlacement: function (error, element) {
      // 错误信息位置
      // $(element).parent().addClass("has-error");
      error.appendTo($(element).siblings("span"));
    },
    submitHandler: function () {
      var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
      var nebPay = new NebPay();
      var img = new Image();
      img.src = $("#pre_picture")[0].src;
      (width = 640), //image resize
        (quality = 0.5); //image quality
      (canvas = document.createElement("canvas")),
        (drawer = canvas.getContext("2d"));
      canvas.width = width;
      canvas.height = width * (img.height / img.width);
      drawer.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = canvas.toDataURL("image/jpeg", quality);
      var title = $("#inputTitle").val();
      var content = $("#inputContent").val();
      var to = dappAddress;
      var value = "0";
      var callFunction = "publish";
      var callArgs = [];
      callArgs.push(title);
      callArgs.push(content);
      callArgs.push(img.src);
      console.log(callArgs);
      $("#submitbutton").val("头条发布中...");
      $("#submitbutton").attr("disabled", true);
      nebPay.call(to, value, callFunction, JSON.stringify(callArgs), {
        //使用nebpay的call接口去调用合约,
        listener: cbPush
      });
      function cbPush(resp) {
        console.log("response of push: " + resp);
        $("#submitbutton").attr("disabled", false);
        $("#submitbutton").val("我要发头条");
        $("#myModal").modal("hide");
      }
    }
  });
});
