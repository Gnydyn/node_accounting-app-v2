'use strict';

const express = require('express');

function createServer() {
  const app = express();

  app.use(express.json());

  const users = [];
  const expenses = [];
  let nextUserId = 1;
  let nextExpenseId = 1;

  // USERS

  app.get('/users', (req, res) => {
    res.json(users);
  });

  app.post('/users', (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send('Name is required');
    }

    const user = {
      id: nextUserId++,
      name,
    };

    users.push(user);

    res.status(201).json(user);
  });

  app.get('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).send('Invalid user ID');
    }

    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  });

  app.patch('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (!id || !name) {
      return res.status(400).send('Invalid user ID or name');
    }

    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    user.name = name;

    res.json(user);
  });

  app.delete('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    users.splice(userIndex, 1);
    res.sendStatus(204);
  });

  // EXPENSES

  app.get('/expenses', (req, res) => {
    const { userId, categories, from, to } = req.query;

    let result = [...expenses];

    if (userId !== undefined) {
      result = result.filter((e) => String(e.userId) === String(userId));
    }

    if (categories !== undefined) {
      const categoryList = Array.isArray(categories)
        ? categories
        : [categories];

      result = result.filter((e) => categoryList.includes(e.category));
    }

    if (from !== undefined) {
      result = result.filter((e) => new Date(e.spentAt) >= new Date(from));
    }

    if (to !== undefined) {
      result = result.filter((e) => new Date(e.spentAt) <= new Date(to));
    }

    res.json(result);
  });

  app.post('/expenses', (req, res) => {
    const { userId, spentAt, title, amount, category, note } = req.body;

    if (
      userId === undefined ||
      !spentAt ||
      !title ||
      amount === undefined ||
      !category
    ) {
      return res.status(400).send('Invalid expense data');
    }

    const user = users.find((u) => u.id === Number(userId));

    if (!user) {
      return res
        .status(400)
        .json({ message: 'User with given id does not exist' });
    }

    const expense = {
      id: nextExpenseId++,
      userId,
      spentAt,
      title,
      amount,
      category,
      note,
    };

    expenses.push(expense);

    res.status(201).json(expense);
  });

  app.get('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).send('Invalid expense ID');
    }

    const expense = expenses.find((e) => e.id === id);

    if (!expense) {
      return res.status(404).send('Expense not found');
    }

    res.json(expense);
  });

  app.patch('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).send('Invalid expense ID');
    }

    const expense = expenses.find((e) => e.id === id);

    if (!expense) {
      return res.status(404).send('Expense not found');
    }

    Object.assign(expense, req.body);

    res.json(expense);
  });

  app.delete('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);

    const expenseIndex = expenses.findIndex((e) => e.id === id);

    if (expenseIndex === -1) {
      return res.status(404).send('Not found');
    }

    expenses.splice(expenseIndex, 1);
    res.sendStatus(204);
  });

  return app;
}

module.exports = {
  createServer,
};
