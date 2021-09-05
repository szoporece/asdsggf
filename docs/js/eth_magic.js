
window.tokencreatorLoaded = 0;

window.addEventListener('load', function () {


  //document.getElementById("validationForm").style.display = "none";
 // document.getElementById("sumbmitForm").style.display = "initial";

 document.getElementById("contractSourceCode").innerHTML = contractSourceCodeTextData;


  if (typeof web3 !== 'undefined') {

    window.ethereum.enable();

    startApp(web3);
  }
  else {
    $('#metamask_alert_message').html(gametext.error[0]);
    $('#metamask_alert').modal('show');
  }




});
// WEB3 INIT DONE!

const contract_address = "0x25Fad1c8ae76F214928b30bc0b59899a37cfDfCf";

const pancakeRouter = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";

var account = web3.eth.accounts[0];

function startApp(web3) {

  window.ethereum.enable();

  web3 = new Web3(web3.currentProvider);


  web3.eth.getAccounts().then(() => {
    contract_init(); // GAME LOAD!
  }
  );


}


function copytext(target) {

   /* Get the text field */
   var copyText = document.getElementById(target);

   /* Select the text field */
   copyText.select();
   copyText.setSelectionRange(0, 9999999999); /* For mobile devices */
 
    /* Copy the text inside the text field */
   navigator.clipboard.writeText(copyText.value);
 
   
}


function contract_init() {
  if (typeof web3.eth.accounts[0] != 'undefined') {

 
    game.user_address = web3.eth.accounts[0];

    account = web3.eth.accounts[0];

    deployerContract = web3.eth.contract(abi).at(contract_address);


    document.getElementById("myBtn").addEventListener("click", function() {

 
      createContract();


  
    });


    // GET ETH BALANCE OF USER
    web3.eth.getBalance(game.user_address, function (err, ress) {
      if (!err) {
        game.ethbalance = web3.fromWei(ress, 'ether');;
        console.log("ETH balance: " + game.ethbalance + " Ether");
      }
    });


    // WHY IT IS SO UGLY JS WHY?!
    (async () => {
      await web3.eth.getBlockNumber(
        function (err, ress) {
          web3.eth.getBlock(ress, function (err, ress) {

            if (!ress) {
              setTimeout(function () { contract_init() }, 2000);
            }
            else {
              game.time = parseInt(ress.timestamp);
              console.log("game item: " + game.time);
            }

          });
        }
      )
    })();

  }

}


function createContract() {

  deployerContract = web3.eth.contract(abi).at(contract_address);

  const value = web3.toWei('0.2', 'ether');

  const name = document.getElementById("name").value || "Test Token2";
  const symbol = document.getElementById("symbol").value || "TST2";
  const decimals = Number(document.getElementById("decimals").value) || 8;
  const supply = Number(document.getElementById("supply").value) || 100000000;
  const txFee= Number(document.getElementById("txFee").value) || 2;
  const lpFee = Number(document.getElementById("lpFee").value) || 2;
  const maxAmount = Number(document.getElementById("maxAmount").value) >= supply / 1000 ? Number(document.getElementById("maxAmount").value) :supply;
  const sellMaxAmount = Number(document.getElementById("maxAmount").value) >= supply / 1000 ? Number(document.getElementById("maxAmount").value) :supply;

 // console.log(name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount);

  console.log(abiEncoder(name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,pancakeRouter,account));

  const contractArgumentsData = abiEncoder(name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,pancakeRouter,account);

  
  deployerContract.createChild.sendTransaction(name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,pancakeRouter,account, { from: account, value: value, gasPrice: game.default_gas_price }, function (err, ress) {
    waitForReceipt(ress, function (receipt) {

      console.log('Receipt', receipt);

      const newContractAddress = receipt.logs[1].address;

      console.log(newContractAddress);

      localStorage.setItem(newContractAddress, JSON.stringify({
        name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,pancakeRouter,account
      }));

      console.log({
        name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,pancakeRouter,account
      })

      document.getElementById("tokenAddress").innerHTML = newContractAddress;

      document.getElementById("contractArguments").innerHTML = contractArgumentsData;

      document.getElementById("contractSourceCode").innerHTML = contractSourceCodeTextData;

      document.getElementById("validationForm").style.display = "initial";
      document.getElementById("sumbmitForm").style.display = "none";

      console.log('Force!');
    });
  });

}




function callback(error, result) {
  if (!error) {
    console.log(result);
  }
  else {
    console.log(error);
  }
};


function waitForReceipt(hash, callback) {
  web3.eth.getTransactionReceipt(hash, function (err, receipt) {
    if (err) {
      error(err);
    }

    if (receipt !== null) {
      // Transaction went through
      if (callback) {
        callback(receipt);
      }
    } else {
      // Try again in 1 second
      window.setTimeout(function () {
        waitForReceipt(hash, callback);
      }, 1000);
    }
  });
}

function toETH(number) {
  return web3.fromWei(number, 'ether');
}