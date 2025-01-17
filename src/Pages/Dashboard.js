import React, { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Button, Tab, Tabs, Modal } from "react-bootstrap";
import ExpPieChart from "../Components/ExpPieChart";
import ExpensesByCategory from "../Components/ExpensesByCategory";
import { ReactComponent as InfoCircle } from "../Icons/info-circle.svg";

export default function Dashboard({ expensesCategory, categoriesData }) {
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [focusBar, setFocusBar] = useState(null);
  const [view, setView] = useState("daily");
  const [activeKey, setActiveKey] = useState("bargraph");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const [filteredExpenses, setFilteredExpenses] = useState([]);

  // Function to find the minimum, maximum date in expensesList
  const calculateStartAndEndDates = (expensesCategory, view) => {
    let endDate = new Date();
    let firstDate = null;
    expensesCategory.forEach((expense) => {
      const date = new Date(expense.date);
      if (!endDate || date > endDate) {
        endDate = date;
      }
      if (!firstDate || date < firstDate) {
        firstDate = date;
      }
    });
    // Calculate the start date based on the view
    let startDate = new Date(endDate);
    if (view === "monthly") {
      startDate.setMonth(endDate.getMonth() - 12); // 1 month before end date
    } else if (view === "yearly") {
      startDate.setFullYear(endDate.getFullYear() - 3); // 3 years before end date
    } else {
      startDate.setMonth(startDate.getMonth() - 1); // 1 month before end date
    }
    // Check calculated start date with first date. If first date is later than calculated start date. set start date=first date
    if (firstDate > startDate) {
      startDate = firstDate;
    }
    return { startDate, endDate };
  };

  // Function to generate a list of all possible period between start and end date
  const generateDatesInRange = (startDate, endDate, view) => {
    const dates = [];
    let currentDate = new Date(endDate);
    while (currentDate >= startDate) {
      let period;
      if (view === "daily") {
        period = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD
      } else if (view === "monthly") {
        period = currentDate.toISOString().slice(0, 7); // YYYY-MM
      } else if (view === "yearly") {
        period = currentDate.toISOString().slice(0, 4); // YYYY
      }
      // only push period into dates if it is new
      if (!dates.includes(period)) {
        dates.push(period);
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return dates;
  };

  // Function to calculate display amount
  const calculateDisplayAmount = (
    expensesCategory,
    view,
    startDate,
    endDate
  ) => {
    // sum display amount by period
    const displayAmountByPeriod = {};
    expensesCategory.forEach((expense) => {
      let period = new Date(expense.date);
      if (view === "monthly") {
        period = period.toISOString().slice(0, 7);
      } else if (view === "yearly") {
        period = period.toISOString().slice(0, 4);
      } else {
        period = expense.date;
      }
      const displayAmount = parseFloat(expense.displayAmount);
      if (!displayAmountByPeriod[period]) {
        displayAmountByPeriod[period] = 0;
      }
      displayAmountByPeriod[period] += displayAmount;
      displayAmountByPeriod[period] = parseFloat(
        displayAmountByPeriod[period].toFixed(2)
      );
    });

    // using all periods, insert in 0 for periods that are not in displayamountby period
    const allPeriods = generateDatesInRange(startDate, endDate, view);
    allPeriods.forEach((period) => {
      if (!displayAmountByPeriod[period]) {
        displayAmountByPeriod[period] = 0;
      }
    });
    return { allPeriods, displayAmountByPeriod };
  };

  // Call calculateDisplayAmount function with the selected view
  const { allPeriods, displayAmountByPeriod } = calculateDisplayAmount(
    expensesCategory,
    view,
    startDate,
    endDate
  );

  // Transform amountByDate into an array of objects with 'date' and 'amount' keys
  const chartData = allPeriods.map((period) => ({
    period,
    displayAmount: displayAmountByPeriod[period],
  }));
  // Sort the chartData array based on the date values
  chartData.sort((a, b) => new Date(a.period) - new Date(b.period));

  // set tooltip for bar graph
  const CustomTooltip = ({ payload, label, active }) => {
    if (active) {
      return (
        <div className={"Custom-Tooltip"}>
          <strong>{label}</strong>
          <br />
          {"Amount: " + payload[0].value}
        </div>
      );
    }
    return null;
  };

  const viewButtons = ["daily", "monthly", "yearly"].map((viewName) => (
    <Button
      key={viewName}
      onClick={() => setView(viewName)}
      className={
        view === viewName
          ? "dashboard-view-button-selected"
          : "dashboard-view-button-default"
      }
    >
      <b>{viewName.charAt(0).toUpperCase() + viewName.slice(1)}</b>
    </Button>
  ));

  // Update the startDate and endDate using useState and the calculateStartAndEndDates function
  useEffect(() => {
    const { startDate, endDate } = calculateStartAndEndDates(
      expensesCategory,
      view
    );
    setStartDate(startDate);
    setEndDate(endDate);
  }, [expensesCategory, view]);

  // Reset selectedPeriod whenever the view changes
  useEffect(() => {
    setSelectedPeriod("");
    setFocusBar(null); // Reset the focused bar as well
  }, [view]);

  /* Filter expenses based on the selected date. If selectedDate is not null, filter expensesList such that expense.date is equiv to selectedDate, else show all according to the view. Used for pie chart and list expenses*/
  useEffect(() => {
    const filterExpenses = () => {
      if (selectedPeriod) {
        const filtered = expensesCategory.filter((expense) => {
          if (view === "daily") {
            return expense.date.slice(0, 10) === selectedPeriod;
          } else if (view === "monthly") {
            return expense.date.slice(0, 7) === selectedPeriod;
          } else if (view === "yearly") {
            return expense.date.slice(0, 4) === selectedPeriod;
          } else {
            return false;
          }
        });
        setFilteredExpenses(filtered);
      } else {
        const filtered = expensesCategory.filter((expense) => {
          if (view === "daily") {
            return (
              expense.date >= startDate.toISOString().slice(0, 10) &&
              expense.date <= endDate.toISOString().slice(0, 10)
            );
          } else if (view === "monthly") {
            return (
              expense.date.slice(0, 7) >= startDate.toISOString().slice(0, 7) &&
              expense.date.slice(0, 7) <= endDate.toISOString().slice(0, 7)
            );
          } else if (view === "yearly") {
            return (
              expense.date.slice(0, 4) >= startDate.toISOString().slice(0, 4) &&
              expense.date.slice(0, 4) <= endDate.toISOString().slice(0, 4)
            );
          } else {
            return false;
          }
        });
        setFilteredExpenses(filtered);
      }
    };

    filterExpenses();
  }, [view, expensesCategory, selectedPeriod, startDate, endDate]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>
          Total spending
          <sup>
            <Button variant="link" onClick={handleShow}>
              <InfoCircle
                width="20px"
                height="20px"
                color="var(--main-green)"
              />
            </Button>
          </sup>
        </h1>
      </div>
      <div className="dashboard-main">
        <div className="dashboard-view-buttons-all ">{viewButtons}</div>
        <Tabs
          activeKey={activeKey}
          onSelect={(k) => setActiveKey(k)}
          defaultActiveKey="bargraph"
          fill
        >
          <Tab
            eventKey="bargraph"
            title={
              <span
                className={
                  activeKey === "bargraph"
                    ? "active-dashboard-tab"
                    : "inactive-dashboard-tab"
                }
              >
                <b>Bar Graph</b>
              </span>
            }
          >
            <div style={{ margin: "10px 0 20px 0" }}>
              <b>
                {" "}
                {selectedPeriod
                  ? `Expenses for ${selectedPeriod}`
                  : `Expenses from ${startDate
                      .toISOString()
                      .slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`}
              </b>
            </div>
            <div className="chart-container">
              <div className="chart-wrapper">
                <BarChart
                  width={500}
                  height={300}
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  onClick={(state) => {
                    if (state.activePayload) {
                      const { period } = state.activePayload[0].payload;
                      const index = state.activeTooltipIndex;
                      if (period === selectedPeriod) {
                        setSelectedPeriod(""); // unselect the bar if it's already selected
                        setFocusBar(null); // remove focus from the bar
                      } else {
                        setSelectedPeriod(period); // select the bar
                        setFocusBar(index); // set focus to the bar
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[0, "dataMax"]} />
                  <Tooltip cursor={false} content={<CustomTooltip />} />
                  <Bar dataKey="displayAmount">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          focusBar === index || focusBar === null
                            ? "var(--main-green)"
                            : "#cac8c8"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </div>
            </div>
          </Tab>
          <Tab
            eventKey="piechart"
            title={
              <span
                className={
                  activeKey === "piechart"
                    ? "active-dashboard-tab"
                    : "inactive-dashboard-tab"
                }
              >
                <b>Pie Chart</b>
              </span>
            }
          >
            <div style={{ margin: "10px 0 20px 0" }}>
              <b>
                {" "}
                {selectedPeriod
                  ? `Expenses for ${selectedPeriod}`
                  : `Expenses from ${startDate
                      .toISOString()
                      .slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`}
              </b>
            </div>
            <div className="piechart-container">
              <div className="chart-wrapper">
                <ExpPieChart
                  filteredExpenses={filteredExpenses}
                  categoriesData={categoriesData}
                />
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
      <div className="dashboard-expenses">
        <ExpensesByCategory filteredExpenses={filteredExpenses} />
      </div>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Daily:</strong> Shows the expenses on a daily basis for last
            month.
          </p>
          <p>
            <strong>Monthly:</strong> Shows the total expenses for each month
            for the past 12 months.
          </p>
          <p>
            <strong>Yearly:</strong> Shows the total expenses for each year for
            the last 3 years.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button className="close-button" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
