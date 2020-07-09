import React from 'react';
import ReactDOM from 'react-dom';
import { AppointmentsDayViewLoader } from '../src/AppointmentsDayViewLoader';

export const App = () => (
  <React.Fragment>
    <div className="button-bar">
      <button type='button' id='addCustomer'>
        Add customer and appointment
      </button>
    </div>
    <AppointmentsDayViewLoader />
  </React.Fragment>
)
