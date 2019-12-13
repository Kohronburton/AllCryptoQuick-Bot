import rp from 'request-promise';

const _apiRequest = async options => {
  try {
    return await rp(options);
  } catch (err) {
    console.log(err.error.error);
  }
};

export const getAllCurrencies = async () => {
  const options = {
    uri: `${process.env.CN_API_URL}/currencies?active=true?api_key=${process.env.CN_API_KEY}`,
    headers: {
        'Content-Type': 'application/json'
    },
    json: true
  };

  return await _apiRequest(options);
};

export const getPairs = async () => {
  const options = {
    uri: `${process.env.CN_API_URL}/market-info/available-pairs/?api_key=${process.env.CN_API_KEY}`,
    headers: {
        'Content-Type': 'application/json'
    },
    json: true
  };

  return await _apiRequest(options);
};

export const getMinimumAmount = async pair => {
  const options = {
    uri: `${process.env.CN_API_URL}/min-amount/${pair}?api_key=${process.env.CN_API_KEY}`,
    headers: {
        'Content-Type': 'application/json'
    },
    json: true
  };

  return await _apiRequest(options);
};

export const getCurrInfo = async cur => {
  const options = {
    uri: `${process.env.CN_API_URL}/currencies/${cur}?api_key=${process.env.CN_API_KEY}`,
    headers: {
        'Content-Type': 'application/json'
    },
    json: true
  };

  return await _apiRequest(options);
};

export const getExchAmount = async (amount, fromTo) => {
  const options = {
    uri: `${process.env.CN_API_URL}/exchange-amount/${amount}/${fromTo}?api_key=${process.env.CN_API_KEY}`,
    headers: {
        'Content-Type': 'application/json'
    },
    json: true
  };

  return await _apiRequest(options);
};

export const sendTransactionData = async data => {
  const options = {
    method: 'POST',
    uri: `${process.env.CN_API_URL}/transactions/${process.env.CN_API_KEY}`,
    body: data,
    headers: {
      'Content-Type': 'application/json'
    },
    json: true
  };

  return await _apiRequest(options);
};

export const getTransactionStatus = async id => {
  const options = {
    uri: `${process.env.CN_API_URL}/transactions/${id}/${process.env.CN_API_KEY}`,
    json: true
  };

  return await _apiRequest(options);
};
