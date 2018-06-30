"use strict";
var dappAddress1 = "n1koy3jwVv1RtZ3DkHTbH6VHWkZFT4aiNW3";
var dappAddress2 = "n1gsLRXcyUKmrD9unVfgB4QyEMNoTJ4ziSJ";
var netbase = "https://mainnet.nebulas.io";

window.onload = function () {

  if (typeof webExtensionWallet === "undefined") {
    $("#noExtension").attr("style", "display:block;");
    $("#submitbutton").attr("disabled", true);
  } else {
    $("#submitbutton").attr("disabled", false);
  }
};

function getAccount() {
  var NebPay = require("nebpay");
  var nebPay = new NebPay();
  nebPay.simulateCall(dappAddress1, "0", "getAccount", "", {
    listener: getAccountCB
  });
};
function getAccountCB(cb) {
  var NebPay = require("nebpay");
  var nebPay = new NebPay();
  if (cb == 'error: please import wallet file') {
    serialNumber = nebPay.call(dappAddress1, 0, "xxxxxxxx", "[]", { //使用nebpay的call接口去调用合约,
      listener: null        //设置listener, 处理交易返回信息
    });
    return;
  }
  var err = cb.execute_err;
  if (err !== "") {
    alert("请使用Mainnet进行游戏");
    return;
  }
  var result = JSON.parse(cb.result);
  var isReload = false;
  var cook = $.cookie('myaddress') + "";
  var account = result;
  if (account != undefined && cook == undefined && account.length > 10 && cook.length > 10 && cook != account) {
    isReload = true;
  }
  if (cook == '') {
    isReload = true;
  }

  if (account == undefined || account.length < 10) {
    alert('注意：请使用谷歌浏览器、并且安装<a class="p-2 text-dark" target="_blank" href="https://github.com/ChengOrangeJu/WebExtensionWallet">星云钱包插件</a>来玩');
  } else {
    $.cookie('myaddress', account, { expires: 7 });
    if (isReload) {
      location.reload();
    }
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

$(function () {
  $("#submitbutton").click(function () {
    var NebPay = require("nebpay");
    var nebPay = new NebPay();
    var score = parseInt($("#scoreSpan").val());
    var distance = parseInt($("#distanceSpan").val());
    var coin = parseInt($("#coinSpan").val());
    var sdchash = $("#sdchash").val();

    var to = dappAddress1;
    var value = "0";
    var callFunction = "saveRecord";
    var callArgs = [];
    callArgs.push(score);
    callArgs.push(distance);
    callArgs.push(coin);
    callArgs.push(sdchash);
    $("#submitbutton").attr("disabled", true);
    $("#myModal").modal("hide");
    $("#mask").removeAttr("hidden");
    nebPay.call(to, value, callFunction, JSON.stringify(callArgs), {
      listener: cbPush
    });
    function cbPush(resp) {
      if (resp) {
        if (resp.txhash) {
          var txhash = resp.txhash;
          let trigger = setInterval(() => {
            var nebulas = require("nebulas"),
              Account = nebulas.Account,
              neb = new nebulas.Neb();
            neb.setRequest(new nebulas.HttpRequest(netbase));

            neb.api.getTransactionReceipt({ hash: txhash }).then((receipt) => {
              console.log('status', receipt.status);

              if (receipt.status != 2) { //not in pending
                console.log(JSON.stringify(receipt));
                if (receipt.status == 1) {
                  clearInterval(trigger);
                  $("#mask").attr("hidden", true);
                  toast("保存成功", 5000);
                  refreshLocalStorage();
                  dappShowAndGetNasPrize();
                } else {
                  clearInterval(trigger);
                  $("#mask").attr("hidden", true);
                  toast(receipt.execute_result, 5000);
                }
              } else {
                console.log("wisteria log:" + JSON.stringify(receipt));
              }
            });
          }, 2000);
        } else {
          $("#mask").attr("hidden", true);
          toast(resp);
        }
      }
    };
  });
  $("#getNasButton").click(function () {
    var NebPay = require("nebpay");
    var nebPay = new NebPay();
    var score = parseInt($("#scoreSpan").val());
    var distance = parseInt($("#distanceSpan").val());
    var coin = parseInt($("#coinSpan").val());
    var sdchash = $("#sdchash").val();
    var dappId = $("#dappId").val();

    var to = dappAddress2;
    var value = "0";
    var callFunction = "getPrize";
    var callArgs = [];
    callArgs.push(score);
    callArgs.push(distance);
    callArgs.push(coin);
    callArgs.push(sdchash);
    callArgs.push(dappId);
    $("#getNasButton").attr("disabled", true);
    $("#dappShowModal").modal("hide");
    $("#mask").removeAttr("hidden");
    nebPay.call(to, value, callFunction, JSON.stringify(callArgs), {
      listener: cbPush
    });
    function cbPush(resp) {
      if (resp) {
        if (resp.txhash) {
          var txhash = resp.txhash;
          let trigger = setInterval(() => {
            var nebulas = require("nebulas"),
              Account = nebulas.Account,
              neb = new nebulas.Neb();
            neb.setRequest(new nebulas.HttpRequest(netbase));

            neb.api.getTransactionReceipt({ hash: txhash }).then((receipt) => {
              console.log('status', receipt.status);

              if (receipt.status != 2) { //not in pending
                console.log(JSON.stringify(receipt));
                if (receipt.status == 1) {
                  clearInterval(trigger);
                  $("#mask").attr("hidden", true);
                  toast("恭喜您获的0.001NAS奖励", 5000);
                } else {
                  clearInterval(trigger);
                  $("#mask").attr("hidden", true);
                  toast(receipt.execute_result, 5000);
                }
              } else {
                console.log("wisteria log:" + JSON.stringify(receipt));
              }
            });
          }, 2000);
        } else {
          $("#mask").attr("hidden", true);
          toast(resp);
        }
      }
    };
  });
  $("#changeDappButton").click(function () {
    var dapps = JSON.parse($("#allDapps").val())
    var size = dapps.length
    var i = parseInt($("#dappIndex").val()) + 1
    //var index = parseInt(Math.random() * size)
    var index = i % size
    var oneOfDapp = dapps[index]
    $("#dappName").html(oneOfDapp.name)
    $("#dev").html(oneOfDapp.author)
    $("#dappDescription").html(oneOfDapp.description)
    $("#remainNAS").html(parseInt(oneOfDapp.remainNas) / 1000000000000000000)
    $("#dappUrl").html(oneOfDapp.webUrl)
    $("#dappUrl").attr("href", oneOfDapp.webUrl)
    $("#dappPic").attr("src", oneOfDapp.dappPic)
    $("#dappId").val(oneOfDapp.verify)
    $("#dappIndex").val(++i)
  });
});

function buySkin(skinNumber, a) {
  var NebPay = require("nebpay");
  var nebPay = new NebPay();

  var to = dappAddress1;
  var value = "0";
  var callFunction = "buySkin";
  var callArgs = [];
  callArgs.push(skinNumber);
  $("#mask").removeAttr("hidden");
  nebPay.call(to, value, callFunction, JSON.stringify(callArgs), {
    listener: cbPush
  });
  function cbPush(resp) {
    if (resp) {
      if (resp.txhash) {
        var txhash = resp.txhash;
        let trigger = setInterval(() => {
          var nebulas = require("nebulas"),
            Account = nebulas.Account,
            neb = new nebulas.Neb();
          neb.setRequest(new nebulas.HttpRequest(netbase));
          neb.api.getTransactionReceipt({ hash: txhash }).then((receipt) => {
            console.log('status', receipt.status);

            if (receipt.status != 2) { //not in pending
              console.log(JSON.stringify(receipt));
              if (receipt.status != 1) {
                clearInterval(trigger);
                $("#mask").attr("hidden", true);
                toast(receipt.execute_result, 5000);
              } else {
                clearInterval(trigger);
                $("#mask").attr("hidden", true);
                toast("购买成功", 5000);
                GEMIOLI.Utils.setInt("coins", GEMIOLI.Utils.getInt("coins", 0) - GEMIOLI.Play.playerTypes[a.currentType].cost);
                GEMIOLI.Utils.setBool("skin" + a.currentType, true);
                GEMIOLI.Play.playerType = a.currentType;
                GEMIOLI.Utils.setInt("skin", GEMIOLI.Play.playerType);
                GEMIOLI.SoundLoader.load("buy").play();
                if (!GEMIOLI.Score.showing) {
                  GEMIOLI.Play.scene3D.remove(GEMIOLI.Play.player);
                  var b = GEMIOLI.Play.objectFromPool(GEMIOLI.Play.playerTypes[GEMIOLI.Play.playerType].id);
                  b.position.set(0, 0, 0);
                  GEMIOLI.Play.scene3D.add(b);
                }

                a.updateData();
                if (!GEMIOLI.Score.showing) {
                  a.hide();
                }
              }
            } else {
              console.log("wisteria log:" + JSON.stringify(receipt));
            }
          });
        }, 2000);
      } else {
        $("#mask").attr("hidden", true);
        toast(resp);
      }
    }
  };
};

function dappShowAndGetNasPrize() {
  var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
  neb.setRequest(new nebulas.HttpRequest(netbase));
  //var from = Account.NewAccount().getAddressString();
  var from = $.cookie('myaddress');
  if (!from) {
    console.log("没有获得地址信息");
    return;
  } else {
    var value = "0";
    var nonce = "0";
    var gas_price = "1000000";
    var gas_limit = "2000000";
    var to = dappAddress1;
    var value = "0";
    var callFunction = "getDappsAllowed";
    var callArgs = [];
    var contract = {
      function: callFunction,
      args: JSON.stringify(callArgs)
    };
    $("#mask").removeAttr("hidden");
    neb.api
      .call(from, dappAddress2, value, nonce, gas_price, gas_limit, contract)
      .then(function (resp) {
        if (resp.execute_err === "" && resp.result != "404") {
          var result = JSON.parse(resp.result);
          var size = result.length;
          if (size && size > 0) {
            var oneOfDapp = result[0];
            console.log("wisteria", oneOfDapp);

            $("#dappName").html(oneOfDapp.name)
            $("#dev").html(oneOfDapp.author)
            $("#dappDescription").html(oneOfDapp.description)
            $("#remainNAS").html(parseInt(oneOfDapp.remainNas) / 1000000000000000000)
            $("#dappUrl").html(oneOfDapp.webUrl)
            $("#dappUrl").attr("href", oneOfDapp.webUrl)
            $("#dappPic").attr("src", oneOfDapp.dappPic)
            $("#allDapps").val(JSON.stringify(result))
            $("#dappId").val(oneOfDapp.verify)
            $("#dappIndex").val(0)

            $("#mask").attr("hidden", true);
            $("#dappShowModal").modal("show");
          } else {
            console.log('gerDappAllowed', '没有Dapp信息')
            toast("目前还没有DAPP上架");
            $("#mask").attr("hidden", true)
          }
        } else {
          console.log(resp.execute_err);
        }
      })
      .catch(function (err) {
        toast(err);
        $("#mask").removeAttr("hidden");
      });
  }
}

function refreshLocalStorage() {
  console.log("refreshLocalStorage");
  getAccount();
  var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
  neb.setRequest(new nebulas.HttpRequest(netbase));
  //var from = Account.NewAccount().getAddressString();
  var from = $.cookie('myaddress');
  if (!from) {
    console.log("没有获得地址信息");
  }
  var value = "0";
  var nonce = "0";
  var gas_price = "1000000";
  var gas_limit = "2000000";
  var to = dappAddress1;
  var value = "0";
  var callFunction = "getRunner";
  var callArgs = [];
  var contract = {
    function: callFunction,
    args: JSON.stringify(callArgs)
  };
  neb.api
    .call(from, dappAddress1, value, nonce, gas_price, gas_limit, contract)
    .then(function (resp) {
      if (resp.execute_err === "" && resp.result != "404") {
        clearLocalStorage();
        setLocalStorage(resp);
      } else {
        clearLocalStorage();
      }
    })
    .catch(function (err) {
      clearLocalStorage();
    });
};

function clearLocalStorage() {
  GEMIOLI.Utils.setInt("coins", 0);
  GEMIOLI.Utils.setInt("score", 0);
  GEMIOLI.Utils.setInt("highscore", 0);
  GEMIOLI.Utils.setInt("skin", 0);
  for (var i = 1; i < 6; i++) {
    GEMIOLI.Utils.setBool("skin" + i, false);
  }
}

function setLocalStorage(resp) {
  var runner = JSON.parse(resp.result);
  var score = runner.bestScore;
  var coins = runner.coins;
  var highscore = runner.coins;
  var skins = runner.skins;

  for (var i = 1; i < skins.length; i++) {
    GEMIOLI.Utils.setBool("skin" + skins[i], true);
  }
  GEMIOLI.Utils.setInt("coins", coins);
  GEMIOLI.Utils.setInt("score", score);
  GEMIOLI.Utils.setInt("highscore", coins);
  GEMIOLI.Utils.setBool("tutorial", false);
  // GEMIOLI.Utils.setInt("coins", GEMIOLI.Utils.getInt("coins", 0);
  // GEMIOLI.Utils.setInt("score", d.score);
  // GEMIOLI.Utils.setBool("skin" + a.currentType.toString(), true);
}

var showLoading = function (sec) {
  $("#mask").removeAttr("hidden");
  setTimeout('$("#mask").attr("hidden", true);', sec * 1000);
};

var toast = function (msg, duration) {
  duration = isNaN(duration) ? 3000 : duration;
  var m = document.createElement("div");
  m.innerHTML = msg;
  m.style.cssText =
    "width:500px; text-align:center; padding:0 10px; height:52px; color:white; line-height:52px; border-radius:5px; position:fixed; top:0; left:0; right:0; bottom:0; margin:auto; z-index:998; background:rgba(0, 0, 0, 0.7); font-size:16px;";
  document.body.appendChild(m);
  setTimeout(function () {
    var d = 0.5;
    m.style.webkitTransition =
      "-webkit-transform " + d + "s ease-in, opacity " + d + "s ease-in";
    m.style.opacity = "0";
    setTimeout(function () {
      document.body.removeChild(m);
    }, d * 1000);
  }, duration);
};