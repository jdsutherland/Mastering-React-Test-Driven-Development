import React from 'react';

export const AppointmentForm = ({
  selectableServices,
  service
}) => {

  return <form id="appointment">
    <label htmlFor="service">Salon service</label>
    <select
      name="service"
      id="service"
      value={service}
      readOnly>
      <option />
      {selectableServices.map(s =>
      <option key={s}>{s}</option>
      )}
    </select>
  </form>
}

AppointmentForm.defaultProps = {
  selectableServices: [
    'Cut',
    'Blow-dry',
    'Cut & color',
    'Beard trim',
    'Cut & beard trim',
    'Extensions']
};
