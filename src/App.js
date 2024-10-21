import React, { useEffect, useState } from "react";
import GlobalStyle from "./styles/global";
import Header from "./components/Header";
import Resume from "./components/Resume";
import Form from "./components/Form";
import Chart from "chart.js/auto";
const App = () => {
  const data = localStorage.getItem("transactions");
  const [transactionsList, setTransactionsList] = useState(
    data ? JSON.parse(data) : []
  );
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [total, setTotal] = useState(0);
  const [months, setMonths] = useState(0);

  useEffect(() => {
    const amountExpense = transactionsList
      .filter((item) => item.expense)
      .map((transaction) => Number(transaction.amount));

    const amountIncome = transactionsList
      .filter((item) => !item.expense)
      .map((transaction) => Number(transaction.amount));

    const expense = amountExpense.reduce((acc, cur) => acc + cur, 0).toFixed(2);
    const income = amountIncome.reduce((acc, cur) => acc + cur, 0).toFixed(2);

    const total = Math.abs(income - expense).toFixed(2);

    setIncome(`R$ ${income}`);
    setExpense(`R$ ${expense}`);
    setTotal(`${Number(income) < Number(expense) ? "-" : ""}R$ ${total}`);

    const calcMonthsToMillion = (monthlyTotal) => {
      const monthlyInvestment = Number(monthlyTotal);
      const fv = 1000000;
      const i = 0.01;

      if (monthlyInvestment <= 0) return 0;

      
      const n = Math.log((fv * i / monthlyInvestment) + 1) / Math.log(1 + i);
      return Math.ceil(n);
    };

    const calculatedMonths = calcMonthsToMillion(total);
    setMonths(calculatedMonths);

    const ctx = document.getElementById("myChart").getContext("2d");

    if (window.chartInstance) {
      window.chartInstance.destroy();
    }

    const years = Math.ceil(calculatedMonths / 12);

    // Cálculo do patrimônio ao longo do tempo
    window.chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({ length: years }, (_, i) => i + 1),
        datasets: [
          {
            label: "Patrimônio ao longo do tempo (anos)",
            data: Array.from({ length: years }, (_, i) => {
              const month = (i + 1) * 12;
              const totalValue = Number(total) * ((Math.pow(1 + 0.01, month) - 1) / 0.01);
              return totalValue;
            }),
            borderColor: "#5656d3",
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Anos',
            },
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valor (R$)',
            },
          },
        },
      },
    });
  }, [transactionsList]);

  const handleAdd = (transaction) => {
    const newArrayTransactions = [...transactionsList, transaction];

    setTransactionsList(newArrayTransactions);

    localStorage.setItem("transactions", JSON.stringify(newArrayTransactions));
  };

  return (
    <>
      <Header />
      <Resume income={income} expense={expense} total={total} />
      <Form
        handleAdd={handleAdd}
        transactionsList={transactionsList}
        setTransactionsList={setTransactionsList}
      />
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <canvas id="myChart" style={{ width: "100%", maxHeight: "400px" }}></canvas>
      </div>
      <GlobalStyle />
    </>
  );
};

export default App;
