const axios = require('axios');

// Generate M-PESA OAuth token
const generateMpesaToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error generating M-PESA token:', error.message);
    throw new Error('Failed to generate M-PESA token');
  }
};

// Format timestamp for M-PESA
const formatTimestamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hour}${minute}${second}`;
};

// Generate base64 password for M-PESA
const generatePassword = (timestamp) => {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const password = `${shortcode}${passkey}${timestamp}`;

  return Buffer.from(password).toString('base64');
};

// Initiate STK Push
const initiateStkPush = async (phoneNumber, amount, loanId) => {
  try {
    const token = await generateMpesaToken();
    const timestamp = formatTimestamp();
    const password = generatePassword(timestamp);

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: `Loan-${loanId}`,
      TransactionDesc: 'Loan Application Fee Payment',
    };

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      merchantRequestID: response.data.MerchantRequestID,
      checkoutRequestID: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
    };
  } catch (error) {
    console.error('Error initiating STK Push:', error.message);
    throw new Error('Failed to initiate M-PESA payment');
  }
};

// Handle M-PESA callback
const handleMpesaCallback = (callbackData) => {
  try {
    const { Body } = callbackData;
    const { stkCallback } = Body;

    if (!stkCallback) {
      return { success: false, message: 'Invalid callback data' };
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    if (ResultCode === 0) {
      // Payment successful
      const metadata = {};
      if (CallbackMetadata && CallbackMetadata.Item) {
        CallbackMetadata.Item.forEach(item => {
          metadata[item.Name] = item.Value;
        });
      }

      return {
        success: true,
        merchantRequestID: MerchantRequestID,
        checkoutRequestID: CheckoutRequestID,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        metadata,
      };
    } else {
      // Payment failed
      return {
        success: false,
        merchantRequestID: MerchantRequestID,
        checkoutRequestID: CheckoutRequestID,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
      };
    }
  } catch (error) {
    console.error('Error handling M-PESA callback:', error.message);
    return { success: false, message: 'Callback processing failed' };
  }
};

// Initiate B2C disbursement
const initiateB2CDisbursement = async (phoneNumber, amount, loanId) => {
  try {
    const token = await generateMpesaToken();
    const timestamp = formatTimestamp();

    const payload = {
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID: 'BusinessPayment',
      Amount: amount,
      PartyA: process.env.MPESA_SHORTCODE,
      PartyB: phoneNumber,
      Remarks: `Loan-${loanId}`,
      QueueTimeOutURL: process.env.MPESA_QUEUE_TIMEOUT_URL,
      ResultURL: process.env.MPESA_RESULT_URL,
      Occassion: `Loan Disbursement ${loanId}`,
    };

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      transactionId: response.data.ConversationID || response.data.OriginatorConversationID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
    };
  } catch (error) {
    console.error('Error initiating B2C disbursement:', error.message);
    throw new Error('Failed to initiate loan disbursement');
  }
};

// Handle B2C callback
const handleB2CCallback = (callbackData) => {
  try {
    const { Result } = callbackData;
    const { ResultCode, ResultDesc, TransactionId, ReceiverPartyPublicName } = Result;

    if (ResultCode === 0) {
      // Disbursement successful
      return {
        success: true,
        transactionId: TransactionId,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        receiver: ReceiverPartyPublicName,
      };
    } else {
      // Disbursement failed
      return {
        success: false,
        transactionId: TransactionId,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
      };
    }
  } catch (error) {
    console.error('Error handling B2C callback:', error.message);
    return { success: false, message: 'B2C callback processing failed' };
  }
};

module.exports = {
  generateMpesaToken,
  formatTimestamp,
  generatePassword,
  initiateStkPush,
  handleMpesaCallback,
  initiateB2CDisbursement,
  handleB2CCallback,
};
