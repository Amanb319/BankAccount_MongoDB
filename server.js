const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bank', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a Mongoose Schema for Accounts
const accountSchema = new mongoose.Schema({
  accountNumber: String,
  balance: Number,
});

// Create a Mongoose Model
const Account = mongoose.model('Account', accountSchema);

// Add Account
app.post('/accounts', async (req, res) => {
  try {
    const { accountNumber, balance } = req.body || {};
    const newAccount = new Account({ accountNumber, balance });
    await newAccount.save();
    res.send(`Account ${accountNumber} added successfully.`);
  } catch (error) {
    res.status(400).send('Invalid JSON data received');
  }
});

// Delete Account
app.delete('/accounts/:accountNumber', async (req, res) => {
  const accountNumber = req.params.accountNumber;
  try {
    await Account.deleteOne({ accountNumber });
    res.send('Account deleted successfully');
  } catch (error) {
    res.status(400).send('Error deleting account');
  }
});

// Send Money
app.post('/transactions', async (req, res) => {
  const { senderAccountNumber, receiverAccountNumber, amount } = req.body;

  try {
    const senderAccount = await Account.findOne({ accountNumber: senderAccountNumber });
    const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber });

    if (senderAccount && receiverAccount && senderAccount.balance >= amount) {
      senderAccount.balance -= amount;
      receiverAccount.balance += amount;

      await senderAccount.save();
      await receiverAccount.save();

      res.send('Money sent successfully');
    } else {
      res.status(400).send('Invalid transaction');
    }
  } catch (error) {
    res.status(400).send('Error processing transaction');
  }
});

// View All Accounts
app.get('/accounts', async (req, res) => {
  try {
    const accounts = await Account.find({});
    res.json(accounts);
  } catch (error) {
    res.status(400).send('Error fetching accounts');
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Bank Server');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
