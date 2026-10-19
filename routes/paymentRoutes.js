const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET latest transaction (receipt for Screenshot 1 view)
router.get('/latest', async (req, res) => {
  try {
    const txn = await Transaction.findOne().sort({ createdAt: -1 });
    if (!txn) {
      return res.status(404).json({ success: false, message: 'No transactions found.' });
    }
    res.json({ success: true, data: txn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET transaction by UPI Transaction ID or Mongo ID
router.get('/:idOrUpi', async (req, res) => {
  try {
    const query = req.params.idOrUpi.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.idOrUpi }
      : { upiTransactionId: req.params.idOrUpi };

    const txn = await Transaction.findOne(query);
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    res.json({ success: true, data: txn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST initiate or record new UPI payment
router.post('/pay-consultation', async (req, res) => {
  try {
    const {
      amount = 1111,
      receiverName = 'KRUNAL S KANOJIYA',
      receiverUpiId = '9725885350@ybl',
      senderName = 'PARMAR MAHESHBHAI',
      senderBank = 'STATE BANK OF INDIA 0156',
      senderUpiId = '9924XXXXXX@sbi',
      relatedAppointment,
      relatedPrescription,
    } = req.body;

    const randomUpiTxnId = '10' + Math.floor(1000000000 + Math.random() * 9000000000);
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const maskedReceiver = receiverUpiId.replace(/^(\d{4})\d+/, '$1XXXXXX');

    const transaction = await Transaction.create({
      amount: Number(amount),
      currency: '₹',
      status: 'successful',
      receiverName,
      receiverUpiId,
      receiverMaskedUpi: maskedReceiver || '9725XXXXXX@ybl',
      senderName,
      senderBank,
      senderUpiId,
      upiTransactionId: randomUpiTxnId,
      transactionDateTime: formattedDate,
      paymentType: 'Yono SBI Pay',
      relatedAppointment,
      relatedPrescription,
    });

    res.status(201).json({
      success: true,
      message: 'Payment completed successfully via UPI.',
      data: transaction,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
