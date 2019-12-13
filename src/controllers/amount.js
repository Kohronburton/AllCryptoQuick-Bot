import Scene from 'telegraf/scenes/base';
import { getMinimumAmount } from '../api';
import { getAmountKeyboard } from '../keyboards';
import { messages } from '../messages';
import scenes from '../constants/scenes';
import buttons from '../constants/buttons';

const amount = new Scene(scenes.amount);

amount.enter(async (ctx) => {
  const { tradingData } = ctx.session;
  const { currFrom, currTo } = tradingData;
  const tradePair = `${currFrom.ticker}_${currTo.ticker}`;
  const { minAmount } = await getMinimumAmount(tradePair);

  ctx.session.tradingData = { ...tradingData, minAmount };
  const minAmountMsg = minAmount ? `Minimal amount - <b>${minAmount}</b>` : '';

  await ctx.replyWithHTML(
    `Enter the amount of <b>${currFrom.ticker.toUpperCase()}</b> you would like to exchange.\n${minAmountMsg}`,
    getAmountKeyboard(ctx)
  );
});

amount.hears([/[.,0-9a-zA-Zа-яА-Я]+/gi, buttons.back], async ctx => {
  const { text } = ctx.message;
  const { tradingData } = ctx.session;

  if (text === buttons.back) {
    ctx.session.tradingData = {
      ...tradingData,
      currTo: '',
    };

    delete ctx.session.tradingData.minAmount;

    await ctx.scene.enter(scenes.currTo);
    return;
  }

  const formattingAmount = Number(text.replace(',', '.'));

  if (!formattingAmount || text.match(/0x[\da-f]/i) || tradingData.minAmount > formattingAmount) {
    await ctx.reply(messages.numErr);
    return;
  }

  ctx.session.tradingData = { ...tradingData, amount: formattingAmount };

  await ctx.scene.enter(scenes.estExch);

});

export default amount;