import React, { useState, useEffect } from "react";
import { TrainRoute, TrainType } from "../services/api";
import { validationUtils } from "../utils/validation";
import { formatForInput } from "../utils/timeUtils";
import "./RouteForm.css";

interface RouteStop {
  id?: string;
  station: string;
  time_arrival: string | null;
  order_index: number;
}

interface RouteFormProps {
  initialData?: Partial<TrainRoute>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  submitButtonText: string;
  isSubmitting: boolean;
  error?: string;
  success?: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const RouteForm: React.FC<RouteFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitButtonText,
  isSubmitting,
  error,
  success,
  showDeleteButton = false,
  onDelete,
  isDeleting = false,
}) => {
  const [formData, setFormData] = useState({
    train_number: "",
    train_type: TrainType.EXPRESS,
    departure_station: "",
    arrival_station: "",
    departure_time: "",
    arrival_time: "",
    price: 0,
    total_available_seats: 0,
  });

  const [stops, setStops] = useState<RouteStop[]>([]);
  const [timeValidationError, setTimeValidationError] = useState("");
  const [stopsValidationError, setStopsValidationError] = useState("");

  const trainTypes = [
    { value: TrainType.EXPRESS, label: "Express" },
    { value: TrainType.METRO, label: "Metro" },
    { value: TrainType.SUBURBAN, label: "Suburban" },
    { value: TrainType.REGIONAL, label: "Regional" },
    { value: TrainType.INTERCITY, label: "Intercity" },
    { value: TrainType.HIGH_SPEED, label: "High Speed" },
  ];

  const validateStopsTimes = (
    stops: RouteStop[],
    departureTime: string,
    arrivalTime: string
  ): string | null => {
    if (!stops || stops.length === 0) {
      return null;
    }

    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);

    if (departure >= arrival) {
      return "Departure time must be before arrival time";
    }

    const sortedStops = [...stops].sort(
      (a, b) => a.order_index - b.order_index
    );

    let previousTime = departure;

    for (let i = 0; i < sortedStops.length; i++) {
      const stop = sortedStops[i];

      if (stop.time_arrival) {
        const stopTime = new Date(stop.time_arrival);

        if (stopTime <= previousTime) {
          return `Stop ${i + 1} time must be after the previous stop time`;
        }

        if (stopTime >= arrival) {
          return `Stop ${i + 1} time must be before the arrival time`;
        }

        previousTime = stopTime;
      }
    }

    return null;
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        train_number: initialData.train_number || "",
        train_type: initialData.train_type || TrainType.EXPRESS,
        departure_station: initialData.departure_station || "",
        arrival_station: initialData.arrival_station || "",
        departure_time: initialData.departure_time
          ? formatForInput(initialData.departure_time)
          : "",
        arrival_time: initialData.arrival_time
          ? formatForInput(initialData.arrival_time)
          : "",
        price: initialData.price || 0,
        total_available_seats: initialData.total_available_seats || 0,
      });

      // Load stops
      if (initialData.stops && initialData.stops.length > 0) {
        const formattedStops = initialData.stops.map((stop) => ({
          id: stop.id,
          station: stop.station,
          time_arrival: stop.time_arrival
            ? formatForInput(stop.time_arrival)
            : null,
          order_index: stop.order_index,
        }));
        setStops(formattedStops);
      } else {
        setStops([]);
      }
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const fieldMap: { [key: string]: string } = {
      trainNumber: "train_number",
      trainType: "train_type",
      departureStation: "departure_station",
      arrivalStation: "arrival_station",
      departureTime: "departure_time",
      arrivalTime: "arrival_time",
    };

    const apiFieldName = fieldMap[name] || name;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [apiFieldName]:
          name === "price" || name === "total_available_seats"
            ? Number(value)
            : value,
      };

      if (name === "departureTime" || name === "arrivalTime") {
        const timeError = validationUtils.validateRouteTimes(
          newData.departure_time || "",
          newData.arrival_time || ""
        );
        setTimeValidationError(timeError || "");

        const stopsError = validateStopsTimes(
          stops,
          newData.departure_time || "",
          newData.arrival_time || ""
        );
        setStopsValidationError(stopsError || "");
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTimeValidationError("");
    setStopsValidationError("");

    const timeError = validationUtils.validateRouteTimes(
      formData.departure_time,
      formData.arrival_time
    );

    if (timeError) {
      setTimeValidationError(timeError);
      return;
    }

    const stopsError = validateStopsTimes(
      stops,
      formData.departure_time,
      formData.arrival_time
    );

    if (stopsError) {
      setStopsValidationError(stopsError);
      return;
    }

    const submitData = {
      ...formData,
      stops: stops.map((stop) => ({
        station: stop.station,
        time_arrival: stop.time_arrival ? stop.time_arrival : null,
        order_index: stop.order_index,
      })),
    };

    await onSubmit(submitData);
  };

  // Stop management functions
  const addStop = () => {
    const newStop = {
      station: "",
      time_arrival: null,
      order_index: stops.length + 1,
    };
    setStops([...stops, newStop]);
  };

  const updateStop = (index: number, field: string, value: string | null) => {
    const updatedStops = stops.map((stop, i) => {
      if (i === index) {
        return {
          ...stop,
          [field]: value,
        };
      }
      return stop;
    });
    setStops(updatedStops);

    if (field === "time_arrival") {
      const stopsError = validateStopsTimes(
        updatedStops,
        formData.departure_time,
        formData.arrival_time
      );
      setStopsValidationError(stopsError || "");
    }
  };

  const removeStop = (index: number) => {
    const updatedStops = stops.filter((_, i) => i !== index);
    const reorderedStops = updatedStops.map((stop, i) => ({
      ...stop,
      order_index: i + 1,
    }));
    setStops(reorderedStops);
  };

  const moveStopUp = (index: number) => {
    if (index === 0) return;
    const updatedStops = [...stops];
    [updatedStops[index - 1], updatedStops[index]] = [
      updatedStops[index],
      updatedStops[index - 1],
    ];
    const reorderedStops = updatedStops.map((stop, i) => ({
      ...stop,
      order_index: i + 1,
    }));
    setStops(reorderedStops);
  };

  const moveStopDown = (index: number) => {
    if (index === stops.length - 1) return;
    const updatedStops = [...stops];
    [updatedStops[index], updatedStops[index + 1]] = [
      updatedStops[index + 1],
      updatedStops[index],
    ];
    const reorderedStops = updatedStops.map((stop, i) => ({
      ...stop,
      order_index: i + 1,
    }));
    setStops(reorderedStops);
  };

  return (
    <form onSubmit={handleSubmit} className="route-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="trainNumber">Train Number</label>
          <input
            type="text"
            id="trainNumber"
            name="trainNumber"
            value={formData.train_number}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            placeholder="e.g., IC101"
          />
        </div>

        <div className="form-group">
          <label htmlFor="trainType">Train Type</label>
          <select
            id="trainType"
            name="trainType"
            value={formData.train_type}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          >
            {trainTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="departureStation">Departure Station</label>
          <input
            type="text"
            id="departureStation"
            name="departureStation"
            value={formData.departure_station}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            placeholder="e.g., New York"
          />
        </div>

        <div className="form-group">
          <label htmlFor="arrivalStation">Arrival Station</label>
          <input
            type="text"
            id="arrivalStation"
            name="arrivalStation"
            value={formData.arrival_station}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            placeholder="e.g., Boston"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="departureTime">Departure Time</label>
          <input
            type="datetime-local"
            id="departureTime"
            name="departureTime"
            value={formData.departure_time}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="arrivalTime">Arrival Time</label>
          <input
            type="datetime-local"
            id="arrivalTime"
            name="arrivalTime"
            value={formData.arrival_time}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">Price ($)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            disabled={isSubmitting}
            placeholder="89.50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="total_available_seats">Available Seats</label>
          <input
            type="number"
            id="total_available_seats"
            name="total_available_seats"
            value={formData.total_available_seats}
            onChange={handleInputChange}
            required
            min="1"
            disabled={isSubmitting}
            placeholder="200"
          />
        </div>
      </div>

      {/* Route Stops Section */}
      <div className="stops-section">
        <div className="stops-header">
          <h3>Route Stops</h3>
          <button
            type="button"
            onClick={addStop}
            className="btn btn-secondary btn-sm"
            disabled={isSubmitting}
          >
            + Add Stop
          </button>
        </div>

        {stops.length === 0 ? (
          <div className="no-stops">
            <p>No stops added. This will be a direct route.</p>
          </div>
        ) : (
          <div className="stops-list">
            {stops.map((stop, index) => (
              <div key={index} className="stop-item">
                <div className="stop-order">
                  <span>{stop.order_index}</span>
                </div>

                <div className="stop-fields">
                  <div className="form-group">
                    <label>Station Name</label>
                    <input
                      type="text"
                      value={stop.station}
                      onChange={(e) =>
                        updateStop(index, "station", e.target.value)
                      }
                      placeholder="e.g., Hartford"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Arrival Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={stop.time_arrival || ""}
                      onChange={(e) =>
                        updateStop(
                          index,
                          "time_arrival",
                          e.target.value || null
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="stop-actions">
                  <button
                    type="button"
                    onClick={() => moveStopUp(index)}
                    className="btn btn-sm btn-outline"
                    disabled={index === 0 || isSubmitting}
                    title="Move Up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStopDown(index)}
                    className="btn btn-sm btn-outline"
                    disabled={index === stops.length - 1 || isSubmitting}
                    title="Move Down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStop(index)}
                    className="btn btn-sm btn-danger"
                    disabled={isSubmitting}
                    title="Remove Stop"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {timeValidationError && (
        <div className="error-message">{timeValidationError}</div>
      )}
      {stopsValidationError && (
        <div className="error-message">{stopsValidationError}</div>
      )}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="form-actions">
        {showDeleteButton && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="btn btn-danger"
            disabled={isDeleting || isSubmitting}
          >
            {isDeleting ? "Deleting..." : "Delete Route"}
          </button>
        )}
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            isSubmitting || !!timeValidationError || !!stopsValidationError
          }
        >
          {isSubmitting ? "Saving..." : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default RouteForm;
