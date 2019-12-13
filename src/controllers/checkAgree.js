import Scene from 'telegraf/scenes/base';
import { getAgreeKeyboard, getBackKeyboard } from '../keyboards';
import { getIpFromDB, addTransactionToDB } from '../helpers';
import { sendTransactionData } from '../api';
import buttons from '../constants/buttons';
import scenes from '../constants/scenes';

const checkAgree = new Scene(scenes.agree);

checkAgree.enter(async ctx => {
  const { tradingData } = ctx.session;
  const { currFrom, currTo, walletCode, addData, addDataName, amount, amountTotal } = tradingData;
  const { ticker: currFromTicker } = currFrom;
  const { ticker: currToTicker } = currTo;
  const addMsg = addData && addDataName ? `Your ${addDataName} is <b>${addData}</b>.\n` : '';

  await ctx.replyWithHTML(
    `You're sending <b>${amount} ${currFromTicker.toUpperCase()}</b>; you’ll get ~<b>${amountTotal} ${currToTicker.toUpperCase()}</b>.\nYour recipient <b>${currToTicker.toUpperCase()}</b> wallet address is <b>${walletCode}</b>\n${addMsg}\nPlease make sure all the information you’ve entered is correct. Then tap the Confirm button below.`,
    getAgreeKeyboard()
  );
});

checkAgree.hears([buttons.confirm, buttons.back], async ctx => {
  const { text } = ctx.message;

  if (text === buttons.back) {
    if (ctx.session.tradingData.extraId) {
      delete ctx.session.tradingData.extraId;
    }

    if (ctx.session.tradingData.externalIdName) {
      delete ctx.session.tradingData.externalIdName;
    }

    await ctx.scene.enter(scenes.estExch);
    return;
  }

  if (text === buttons.confirm) {
    const { userId, tradingData } = ctx.session;
    const { currFrom, currTo, walletCode, amount, extraId = '', amountTotal } = tradingData;
    const ip = await getIpFromDB(userId);

    const data = {
      userId,
      amount,
      extraId,
      ip,
      from: currFrom.ticker,
      to: currTo.ticker,
      address: walletCode,
    };

    const res = await sendTransactionData(data);

    if (res.payinAddress) {
      await addTransactionToDB(res, userId);

      await ctx.replyWithHTML(
        `You’re sending <b>${amount} ${currFrom.ticker.toUpperCase()}</b>; you’ll get ~<b>${amountTotal} ${currTo.ticker.toUpperCase()}</b>.\nHere is the deposit address for your exchange.\nIn order to start the exchange, use your wallet to send your deposit to this address.`,
        getBackKeyboard()
      );

      await ctx.reply(`${res.payinAddress}`);
      // TODO run worker
      ctx.session = null;

      return;
    }

    await ctx.reply(`Sorry, the address you’ve entered is invalid.`);
    await ctx.scene.enter(scenes.estExch);
  }
});

export default checkAgree;
