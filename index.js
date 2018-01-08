const binance = require('node-binance-api');
const async = require('async');

binance.options({
	'APIKEY': '1LjQBASXyDUc7b2BnKP3xDkYfDpzgBTAUA0S8wlymNsS1AUl8l55oNdoffjJ6n5C',
	'APISECRET': 'ZKblXJsSATwoGVoVTmpQBHQkJshh8K4kIWSM5X5pzvJynYJdnbap3Ke0UjzGKcYW',
});

let myWallets = [];


async function go () {
  await binance.balance(async (balances) => {
    Object.keys(balances).forEach((key) => {
      let available = parseFloat(balances[key].available);
      let onOrder = parseFloat(balances[key].onOrder);
      let total = available + onOrder;
      if (total > 0) myWallets.push({ key, total, available, onOrder });
    });
    await binance.prices((ticker) => {
      myWallets.forEach(async (currency) => {
        if (currency.key !== 'BTC') {
          currency.price = currency.total * parseFloat(ticker[`${currency.key}BTC`]);
          currency.btcSpent = 0;
          await binance.trades(`${currency.key}BTC`, (trades, symbol) => {
            trades.forEach((trade) => {
              currency.btcSpent += parseFloat(trade.price) * parseFloat(trade.qty) + parseFloat(trade.commission) * parseFloat(ticker.BNBBTC);
            });
          });
        } else {
          currency.price = currency.total;
        }
      });
    });
  });
  console.log(myWallets);
}

go();

