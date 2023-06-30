import "../App.css";
import { useEffect, useState } from "react";
import { Button, Form, Modal, InputGroup } from "react-bootstrap";
import { realTimeDatabase, storage } from "../firebase";
import { ref, set, update } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import Geocode from "react-geocode";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
const DB_EXPENSES_FOLDER_NAME = "expenses";
const STORAGE_EXPENSES_FOLDER_NAME = "receiptPhoto";
export default function EditExpenses({
  uid,
  mapRef,
  setExpenseCounter,
  currenciesList,
  expensesCategory,
  categoriesData,
}) {
  // State to handle open and close of modal
  const [show, setShow] = useState(false);
  // States to store expense data
  const [date, setDate] = useState(expensesCategory.date);
  const [category, setCategory] = useState(expensesCategory.category);
  const [currency, setCurrency] = useState(expensesCategory.currency);
  const [amount, setAmount] = useState(expensesCategory.amount);
  const [description, setDescription] = useState(expensesCategory.description);
  const [lat, setLat] = useState(expensesCategory.lat);
  const [lng, setLng] = useState(expensesCategory.lng);
  const [address, setAddress] = useState("");
  const [receiptFile, setReceiptFile] = useState("");
  const [receiptFileValue, setReceiptFileValue] = useState("");
  // Get lat and lng coordinates on 'look up' button press
  const getLatLng = () =>
    Geocode.fromAddress(address, process.env.REACT_APP_API_KEY).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        setLat(lat);
        setLng(lng);
      },
      (error) => {
        console.error(error);
        setLat(null);
        setLng(null);
      }
    );

  // Show / hide modal
  const handleClose = () => {
    setShow(false);
    setReceiptFile("");
    setReceiptFileValue("");
  };
  const handleShow = () => {
    if (expensesCategory) {
      setDate(expensesCategory.date);
      setCategory(expensesCategory.category);
      setCurrency(expensesCategory.currency);
      setAmount(expensesCategory.amount);
      setDescription(expensesCategory.description);
    }
    setShow(true);
  };

  // Update data in db
  const handleUpdate = (e) => {
    e.preventDefault();
    // Get ref key
    const expRef = ref(
      realTimeDatabase,
      `${DB_EXPENSES_FOLDER_NAME}/${uid}/${expensesCategory.id}`
    );
    // Update data at expense reference location
    update(expRef, {
      category: category,
      currency: currency,
      amount: amount,
      lat: lat,
      lng: lng,
      description: description,
      date: date,
    });
    console.log(`expRef: ${expRef}`);
    if (receiptFile) {
      const expFileRef = storageRef(
        storage,
        ` ${STORAGE_EXPENSES_FOLDER_NAME}/${uid}/${receiptFile.name}`
      );
      uploadBytes(expFileRef, receiptFile).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((receiptUrl) => {
          // update expenses db with expenses photo url
          const currExpRef = ref(
            realTimeDatabase,
            `${DB_EXPENSES_FOLDER_NAME}/${uid}/${expensesCategory.id}/receiptUrl`
          );
          set(currExpRef, receiptUrl);
        });
      });
    }
    // Increase expense counter so map in the main page will pan to latest expense location
    setExpenseCounter((prevExpenseCounter) => prevExpenseCounter + 1);
    setReceiptFile("");
    setReceiptFileValue("");
    handleClose();
  };
  // to ensure that selection of the first element in the category will be shown. eg Food will be saved to db as category
  useEffect(() => {
    if (categoriesData.length > 0) {
      setCategory(categoriesData[0]);
    }
  }, [categoriesData]);

  return (
    <>
      <span
        id="edit-button"
        title="Click to edit expense"
        onClick={handleShow}
        style={{ margin: "5px", cursor: "pointer" }}
      >
        ✏️
      </span>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>
            <Form.Select
              aria-label="Default select example"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                Category
              </option>
              {categoriesData.map((categoryObj, index) => (
                <option
                  key={index}
                  value={`${categoryObj.emoji} ${categoryObj.category}`}
                >
                  {categoryObj.emoji} {categoryObj.category}
                </option>
              ))}
            </Form.Select>
            <br />
            <InputGroup className="mb-3">
              <Typeahead
                id="currency-typeahead"
                labelKey="currency"
                placeholder={currency}
                onChange={(selected) => setCurrency(selected[0])}
                options={currenciesList}
              ></Typeahead>
              <Form.Control
                type="number"
                placeholder={amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </InputGroup>
            <Form.Group className="form-group">
              <Form.Label className="compact-label">Location</Form.Label>
              {lat && lng ? (
                <div className="coordinates-display green">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </div>
              ) : (
                <div
                  className="coordinates-display grey-italics"
                  style={{ color: "red" }}
                >
                  <em>Please input address</em>
                </div>
              )}
              <div id="address-look-up">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Form.Control
                    type="text"
                    size="sm"
                    value={address}
                    placeholder="Enter address, click on map, ignore to use current location"
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    id="look-up-btn"
                    onClick={getLatLng}
                    style={{
                      flexShrink: 1,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      minWidth: 0,
                    }}
                  >
                    Look up
                  </Button>
                </div>
              </div>
              <div id="loc-option-2">
                <GoogleMap
                  onClick={(e) => {
                    setLat(e.latLng.lat());
                    setLng(e.latLng.lng());
                  }}
                  mapContainerStyle={{
                    width: "100%",
                    height: "20vh",
                  }}
                  center={
                    lat && lng
                      ? { lat: lat, lng: lng }
                      : {
                          lat: 1.365,
                          lng: 103.815,
                        }
                  }
                  zoom={11}
                >
                  <MarkerF position={{ lat: lat, lng: lng }} />
                </GoogleMap>
                <br />
              </div>
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                type="text"
                placeholder={description}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload receipt</Form.Label>
              <Form.Control
                type="file"
                value={receiptFileValue}
                onChange={(e) => {
                  setReceiptFile(e.target.files[0]);
                  setReceiptFileValue(e.target.value);
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={category === "" || amount === 0}
          >
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
