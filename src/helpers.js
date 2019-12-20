import { getPairs } from './api';
import UserModel from './models/User';
import TransactionModel from './models/Transaction';
import VisitModel from './models/Visit';
import statuses from './constants/statusTransactions';
import { captureException } from '@sentry/node';
import updateSubTypes from './constants/updateSubTypes';
import { messages } from './messages';

// TODO implement answers for another types
export const createAnswerByUpdateSubType = (type) => {
  switch (type) {
    case updateSubTypes.photo:
      return messages.answersByPhoto[getRandomNumber(0, messages.answersByPhoto.length - 1)];
    case updateSubTypes[type]:
      return `It's ${updateSubTypes[type]}`;
    default:
      return null;
  }
};

export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


export const getIpFromDB = async (userId) => {
  const { visits } = await UserModel.findOne({ userId }).populate('visits');
  return visits[visits.length - 1].userIp;
};

export const isAvailableCurr = (name, allCurr) => {
  return allCurr.findIndex(c => {
    return c.ticker.toLowerCase() === name.toLowerCase() ||
      c.name.toLowerCase() === name.toLowerCase();
  });
};

export const pause = time => new Promise(resolve => setTimeout(resolve, time));

export const getCurrencyName = text => {
  const textFromBtn = text.match(/(?<=\().+?(?=\))/gi);
  return textFromBtn ? textFromBtn[0].trim() : text.trim();
};

export const validatePair = async pair => {
  const availablePairs = await getPairs();

  return availablePairs.includes(pair);
};

export const addTransactionToDB = async (trn, telegramUserId) => {
  const user = await UserModel.findOne({ userId: telegramUserId });

  const { id: transactionId, ...fields } = trn;
  const newTrn = await TransactionModel.create({ ...fields, transactionId, owner: user.id, status: statuses.new });

  user.transactions.push(newTrn);

  await user.save();
};

export const getIpAction = async req => {
  let userIp;
  if (req.headers['x-forwarded-for']) {
    userIp = req.headers['x-forwarded-for'].split(',')[0];
  } else if (req.connection && req.connection.remoteAddress) {
    userIp = req.connection.remoteAddress;
  } else {
    userIp = req.ip;
  }

  try {
    const user = await UserModel.findOne({ userId: req.params.id }).populate('Visit');
    const visit = await VisitModel.create({ userIp, ipParsed: new Date(), user: user.id });

    user.visits.push(visit);

    await user.save();
    await visit.save();
  } catch (e) {
    captureException(e);
  }
};
