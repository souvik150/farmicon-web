import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import "./cropPrice.scss";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Price v/s Date",
    },
  },
};

const CropPrice = () => {
  const [stateNames, setStateName] = useState([]);
  const [commodityNames, setCommodityNames] = useState([]);
  const [districtNames, setDistrictNames] = useState([]);
  const [marketNames, setMarketNames] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isChart, setIsChart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const selectedCommodityRef = useRef("");
  const selectedStateRef = useRef("");
  const selectedDistrictRef = useRef("");
  const selectedMarketRef = useRef("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const getStates = async () => {
    try {
      const res = await axios.get("https://data.parthapaul.me/get_data");
      const states = [...new Set(res.data.message.map((item) => item.state))];
      const commodities = [
        ...new Set(res.data.message.map((item) => item.commodity)),
      ];
      const districts = [
        ...new Set(res.data.message.map((item) => item.district)),
      ];
      const markets = [
        ...new Set(res.data.message.map((item) => item.district)),
      ];
      setStateName(states);
      setCommodityNames(commodities);
      setDistrictNames(districts);
      setMarketNames(markets);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStates();
  }, []);

  const getPriceAndDate = async () => {
    if (selectedCommodityRef.current === "" || selectedStateRef.current === "")
      return;
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://data.parthapaul.me/get_data?state=${selectedStateRef.current}&&district=${selectedDistrictRef.current}&market=${selectedMarketRef.current}&commodity=${selectedCommodityRef.current}`
      );
      const dates = res.data.message?.map((d) => d?.arrival_date);
      const prices = res.data.message?.map((d) => Number(d?.modal_price));
      setIsChart(dates.length > 0 && prices.length > 0);

      const data = {
        labels: dates,
        datasets: [
          {
            label: "Price (in Rupees)",
            data: prices,
            backgroundColor: "#3D5A27",
          },
        ],
      };
      setChartData(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCommodityChange = (event) => {
    selectedCommodityRef.current = event.target.value;
  };
  const handleStateChange = (event) => {
    selectedStateRef.current = event.target.value;
  };
  const handleDistrictChange = (event) => {
    selectedDistrictRef.current = event.target.value;
  };
  const handleMarketChange = (event) => {
    selectedMarketRef.current = event.target.value;
  };

  return (
    <div className="crop-container">
      <h1>Crop Price History</h1>
      <div className="selects">
        <select onChange={handleStateChange} name="" id="">
          <option value="">SELECT STATE</option>
          {stateNames.map((state, i) => {
            return (
              <option key={i} value={state}>
                {state}
              </option>
            );
          })}
        </select>
        <select onChange={handleDistrictChange} name="" id="">
          <option value="">SELECT DISTRICT</option>
          {districtNames.map((district, i) => {
            return (
              <option key={i} value={district}>
                {district}
              </option>
            );
          })}
        </select>
        <select onChange={handleMarketChange} name="" id="">
          <option value="">SELECT MANDI</option>
          {marketNames.map((market, i) => {
            return (
              <option key={i} value={market}>
                {market}
              </option>
            );
          })}
        </select>
        <select onChange={handleCommodityChange} name="" id="">
          <option value="">SELECT COMMODITY</option>
          {commodityNames.map((state, i) => {
            return (
              <option key={i} value={state}>
                {state}
              </option>
            );
          })}
        </select>
        <button
          type="button"
          onClick={() => {
            getPriceAndDate();
          }}
        >
          Show
        </button>
      </div>
      {isLoading && (
        <div style={{ textAlign: "center", marginTop: "16vh" }}>Loading...</div>
      )}
      {!isLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "6vh",
          }}
        >
          {isChart === false && (
            <span style={{ textAlign: "center", marginTop: "10vh" }}>
              No Data Found
            </span>
          )}
          {isChart && <Bar options={options} data={chartData} />}
        </div>
      )}
    </div>
  );
};

export default CropPrice;
