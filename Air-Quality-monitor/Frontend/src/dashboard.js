import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { useUserContext } from './context'; // Import useUserContext to access context
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

function Dashboard() {
  const [sensorData, setSensorData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [answer, setAnswer] = useState('');
  const { channelId } = useUserContext(); // Access channelId from context
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!channelId) {
      navigate('/'); // Redirect to login if channelId is not set
    }

    // Function to fetch data
    const fetchData = () => {
      console.log("Channel ID:", channelId); // Log the channelId to check if it's being passed correctly

      // Fetch sensor data
      fetch("https://e6e7-14-194-176-226.ngrok-free.app/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ channelId })
      })
        .then(response => response.json())
        .then(data => {
          setSensorData(data);
          console.log("Fetched data via POST:", data);
        })
        .catch(error => console.error("POST Fetch error:", error));

      // Fetch prediction result
      fetch("https://e6e7-14-194-176-226.ngrok-free.app/api/pred", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ channelId })
      })
        .then(response => response.json())
        .then(predictionData => {
          setPrediction(predictionData.prediction); // only the `prediction` object
          console.log("Prediction Data:", predictionData);
        })
        .catch(error => console.error("Error fetching prediction:", error));
    };

    // Initial fetch when component mounts
    fetchData();

    // Set interval to call fetchData every 1 minute (60000 ms)
    const intervalId = setInterval(fetchData, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [channelId, navigate]);

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
      const question = event.results[0][0].transcript;
      console.log("Question Asked: ", question);
      respondToQuestion(question);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };
  };

  const respondToQuestion = (question) => {
    let response = '';
    const q = question.toLowerCase();
  
    if (q.includes('air quality')) {
      response = prediction?.['MQ-135']?.interpretation || 'Air quality data is not available.';
    } else if (q.includes('temperature')) {
      response = `The current temperature is ${sensorData?.field4} degrees Celsius.`;
    } else if (q.includes('humidity')) {
      response = `The current humidity is ${sensorData?.field5} percent.`;
    } else if (q.includes('mq2')) {
      response = `MQ2 reading is ${sensorData?.field1} ppm.`;
    } else if (q.includes('mq135')) {
      response = `MQ135 reading is ${sensorData?.field2} ppm.`;
    } else if (q.includes('mq9')) {
      response = `MQ9 reading is ${sensorData?.field3} ppm.`;
    } else if (q.includes('forecast value')) {
      response = `
        Forecasts - 
        MQ2: ${prediction?.['MQ-2']?.value ?? 'N/A'}, 
        MQ135: ${prediction?.['MQ-135']?.value ?? 'N/A'}, 
        MQ9: ${prediction?.['MQ-9']?.value ?? 'N/A'},
        Temp: ${prediction?.['TEMPERATURE']?.value ?? 'N/A'}°C,
        Humidity: ${prediction?.['HUMIDITY']?.value ?? 'N/A'}%.`;
    } else if (q.includes('safe to go outside')) {
      const mq135Interp = prediction?.['MQ-135']?.interpretation?.toLowerCase() || '';
      if (mq135Interp.includes('fresh') || mq135Interp.includes('moderate')) {
        console.log("MQ135 Interpretation: ", mq135Interp);
        response = 'Yes, it is safe to go outside.';
      } else if (mq135Interp.includes('unhealthy') || mq135Interp.includes('hazardous')) {
        response = 'No, it is not safe to go outside due to poor air quality.';
      } else {
        console.log("MQ135 Interpretation: ", mq135Interp);
        response = 'I am not sure. Air quality data is unclear.';
      }
    } else if (q.includes('weather')) {
      response = `Current temperature is ${sensorData?.field4}°C and humidity is ${sensorData?.field5}%.`;
    } else {
      response = 'Sorry, I did not understand the question.';
    }
  
    setAnswer(response);
    speakAnswer(response);
  };
  
  const speakAnswer = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  if (!sensorData) return <div>Loading data...</div>;

  return (
    <div className="dashboard-container">
      <div className="echo-header">
        <h1>Echo</h1>
        {/* Display the channelId from context */}
        <span className="channel-id">ID: {channelId || 'Guest'}</span>
      </div>

      <div className="dashboard-image">
        <img
          src="https://i.pinimg.com/474x/59/ab/04/59ab04c75eeb7f3cc7c50cd54ec28b79.jpg"
          alt="Air Quality"
          className="rounded-image"
        />
      </div>

      <div className="sensor-grid">
        <div className="sensor-card">
          <h3>MQ2</h3>
          <p>{sensorData.field1} </p>
          {prediction?.['MQ-2'] && (
            <div className="prediction">
              <p>{prediction['MQ-2'].interpretation}</p>
              <p><strong>ForecastValue:</strong> {prediction['MQ-2'].value} </p>
            </div>
          )}
        </div>
        <div className="sensor-card">
          <h3>MQ135</h3>
          <p>{sensorData.field2} </p>
          {prediction?.['MQ-135'] && (
            <div className="prediction">
              <p>{prediction['MQ-135'].interpretation}</p>
              <p><strong>ForecastValue:</strong> {prediction['MQ-135'].value} </p>
            </div>
          )}
        </div>
        <div className="sensor-card">
          <h3>MQ9</h3>
          <p>{sensorData.field3} </p>
          {prediction?.['MQ-9'] && (
            <div className="prediction">
              <p>{prediction['MQ-9'].interpretation}</p>
              <p><strong>ForecastValue:</strong> {prediction['MQ-9'].value} </p>
            </div>
          )}
        </div>
        <div className="sensor-card">
          <h3>Temperature</h3>
          <p>{sensorData.field4} °C</p>
          {prediction?.['TEMPERATURE'] && (
            <div className="prediction">
              <p>{prediction['TEMPERATURE'].interpretation}</p>
              <p><strong>ForecastValue:</strong> {prediction['TEMPERATURE'].value} °C</p>
            </div>
          )}
        </div>
        <div className="sensor-card">
          <h3>Humidity</h3>
          <p>{sensorData.field5} %</p>
          {prediction?.['HUMIDITY'] && (
            <div className="prediction">
              <p>{prediction['HUMIDITY'].interpretation}</p>
              <p><strong>ForecastValue:</strong> {prediction['HUMIDITY'].value} %</p>
            </div>
          )}
        </div>
      </div>

      {/* Mic icon button */}
      <div className="mic-icon" onClick={startListening}>
        🎙️
      </div>
    </div>
  );
}

export default Dashboard;
