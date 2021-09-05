
window.tokencreatorLoaded = 0;

window.addEventListener('load', function () {
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


function contract_init() {
  if (typeof web3.eth.accounts[0] != 'undefined') {

 
    game.user_address = web3.eth.accounts[0];

    deployerContract = web3.eth.contract(abi).at(contract_address);


    document.getElementById("myBtn").addEventListener("click", function() {

      createContract({});
    //  document.getElementById("demo").innerHTML = "Hello World";
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

  const name = "Test Token 2";
  const symbol = "TST2";
  const decimals = 8;
  const supply = 100000000;
  const txFee= 2;
  const lpFee = 2;
  const maxAmount = 10000;
  const sellMaxAmount = 10000;


  console.log(abiEncoder(name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,pancakeRouter,account));
  


  deployerContract.createChild.sendTransaction(name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,pancakeRouter,account, { from: account, value: value, gasPrice: game.default_gas_price }, function (err, ress) {
    waitForReceipt(ress, function (receipt) {

      console.log('Receipt', receipt);

      const newContractAddress = receipt.logs[1];

      console.log(newContractAddress);

    

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