var chainId = 0;
window.tokencreatorLoaded = 0;

const chainSettings = {
  0: {
    contractAddress: '',
    pancakeRouter: '',
    chainName: 'No Wallet Detected!',
    deployPrice: web3.toWei('0.2', 'ether')
  },
  56: {
    contractAddress: '0x1143e2b736422a70937469d893c74aef6014f2e5',
    pancakeRouter: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    chainName: 'Binance Smart Chain',
    deployPrice: web3.toWei('0.2', 'ether')
  },
  97: {
    contractAddress: '0x',
    pancakeRouter: '0x',
    chainName: 'Binance Test Network',
    deployPrice: web3.toWei('0.2', 'ether')
  },
  777: {
    contractAddress: '0x0aa2037e40a78a169b5214418d66377ab828cb23',
    pancakeRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    chainName: 'Cheap Ethereum Network(cTH)',
    deployPrice: web3.toWei('0.01', 'ether')
  },
   787: {
    contractAddress: '0x0aa2037E40a78A169B5214418D66377ab828cb23',
    pancakeRouter: '0xab06aD5E30c039c0fb628fe8598e569Fb6B97fdc',
    chainName: 'devETH chain',
    deployPrice: web3.toWei('0.01', 'ether')
  }
}


window.addEventListener('load', function () {

  document.getElementById("networkName").innerHTML = chainSettings[chainId].chainName;

  document.getElementById("myBtn2").addEventListener("click", function(event) {
    event.preventDefault();
  });

  document.getElementById("myBtn3").addEventListener("click", function(event) {
    event.preventDefault();
  });

  document.getElementById("validationForm").style.display = "none";
  document.getElementById("sumbmitForm").style.display = "block";

 document.getElementById("contractSourceCode").innerHTML = contractSourceCodeTextData;



  if (typeof web3 !== 'undefined') {

    window.ethereum.enable();

    startApp(web3);
  }
  else {
    alert("Install Metamask / TrustWallet first and switch to BinanceChain network!");
  }




});
// WEB3 INIT DONE!



var account = web3.eth.accounts[0];

function startApp(web3) {

  window.ethereum.enable();


  web3 = new Web3(web3.currentProvider);


  console.log(web3);

  web3.eth.getChainId().then(id => {

    console.log('ChainId: ', id);

    chainId = id;

    document.getElementById("networkName").innerHTML = chainSettings[chainId].chainName;

    console.log(chainSettings[chainId])

  })

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

    deployerContract = web3.eth.contract(abi).at(chainSettings[chainId].contractAddress);





    document.getElementById("myBtn").addEventListener("click", function(event) {

      event.preventDefault();
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

  deployerContract = web3.eth.contract(abi).at(chainSettings[chainId].contractAddress);

  const value = chainSettings[chainId].deployPrice;

  const name = document.getElementById("name").value || "Test Token2";
  const symbol = document.getElementById("symbol").value || "TST2";
  const decimals = Number(document.getElementById("decimals").value) || 8;
  const supply = Number(document.getElementById("supply").value) || 100000000;
  const txFee= Number(document.getElementById("txFee").value) || 2;
  const lpFee = Number(document.getElementById("lpFee").value) || 2;
  const maxAmount = Number(document.getElementById("maxAmount").value) >= supply / 1000 ? Number(document.getElementById("maxAmount").value) :supply;
  const sellMaxAmount = Number(document.getElementById("maxAmount").value) >= supply / 1000 ? Number(document.getElementById("maxAmount").value) :supply;

 // console.log(name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount);

  console.log(abiEncoder(name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,chainSettings[chainId].pancakeRouter,account));

  const contractArgumentsData = abiEncoder(name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,chainSettings[chainId].pancakeRouter,account);

  
  deployerContract.createChild.sendTransaction(name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,chainSettings[chainId].pancakeRouter,account, { from: account, value: value, gasPrice: game.default_gas_price }, function (err, ress) {
    waitForReceipt(ress, function (receipt) {

      console.log('Receipt', receipt);

      const newContractAddress = receipt.logs[1].address;

      console.log(newContractAddress);

      const pancakeRouter = chainSettings[chainId].pancakeRouter;

      localStorage.setItem(newContractAddress, JSON.stringify({
        name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,pancakeRouter,account
      }));

      console.log({
        name,symbol,decimals,supply,txFee,lpFee,maxAmount,sellMaxAmount,pancakeRouter,account
      })

      document.getElementById("tokenAddress").innerHTML = newContractAddress;

      document.getElementById("contractArguments").innerHTML = contractArgumentsData;

      document.getElementById("contractSourceCode").innerHTML = contractSourceCodeTextData;

      document.getElementById("validationForm").style.display = "block";
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
