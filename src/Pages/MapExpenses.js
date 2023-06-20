import "../App.css";
import Map from "../Components/Map";
import ListExpenses from "../Components/ListExpenses";
import Welcome from "./Welcome";
import { useState, useEffect } from "react";
import { realTimeDatabase } from "../firebase";
import { onValue, ref, off } from "firebase/database";
import { useLoadScript } from "@react-google-maps/api";

const DB_EXPENSES_FOLDER_NAME = "expenses";

export default function MapExpenses({ isLoggedIn, uid }) {
  console.log(isLoggedIn);
  console.log(uid);
  const [expenseCounter, setExpenseCounter] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [mapRef, setMapRef] = useState();
  const [expRef, setExpRef] = useState();
  const [highlighted, setHighlighted] = useState(null);
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);

  // Get user's location and assign coordinates to states
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(currentLocation);
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [expenseCounter]);

  // updates expenses array with each additional expense
  useEffect(() => {
    setExpRef(ref(realTimeDatabase, `${DB_EXPENSES_FOLDER_NAME}/${uid}`));
    if (expRef) {
      onValue(expRef, (snapshot) => {
        const expensesData = snapshot.val();
        if (expensesData) {
          const expensesArray = Object.entries(expensesData).map(
            ([key, value]) => ({
              id: key,
              ...value,
            })
          );
          console.log(expensesArray);
          setExpenses(expensesArray);
        }
      });
    }
    return () => {
      if (expRef) {
        off(expRef);
        setExpenses([]);
      }
    };
  }, [uid, mapRef, expenseCounter]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_API_KEY,
  });

  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",
  });

  const handleOnSelect = (expense) => {
    if (highlighted === expense.id) {
      setHighlighted(null);
    } else {
      setHighlighted(expense.id);
      console.log(highlighted);
    }
  };

  return (
    <div>
      {" "}
      {isLoggedIn ? (
        <div className="App">
          <Map
            uid={uid}
            expenseCounter={expenseCounter}
            userLocation={userLocation}
            expenses={expenses}
            setExpenses={setExpenses}
            mapRef={mapRef}
            setMapRef={setMapRef}
            expRef={expRef}
            isLoaded={isLoaded}
            formatter={formatter}
            highlighted={highlighted}
            setHighlighted={setHighlighted}
          />
          <ListExpenses
            uid={uid}
            lat={lat}
            setLat={setLat}
            lng={lng}
            setLng={setLng}
            expenseCounter={expenseCounter}
            setExpenseCounter={setExpenseCounter}
            userLocation={userLocation}
            expenses={expenses}
            setExpenses={setExpenses}
            formatter={formatter}
            highlighted={highlighted}
            setHighlighted={setHighlighted}
            handleOnSelect={handleOnSelect}
          />
        </div>
      ) : (
        <div className="App">
          <Map
            uid={uid}
            mapRef={mapRef}
            setMapRef={setMapRef}
            isLoaded={isLoaded}
            userLocation={userLocation}
          />
          <Welcome />
        </div>
      )}
    </div>
  );
}
