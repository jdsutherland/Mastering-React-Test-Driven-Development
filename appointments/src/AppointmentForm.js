import React, { useState } from 'react'

const dailyTimeSlots = (salonOpensAt, salonClosesAt) => {
  const totalSlots = (salonClosesAt - salonOpensAt) * 2;
  const startTime = new Date().setHours(salonOpensAt, 0, 0, 0);
  const increment = 30 * 60 * 1000;
  return Array(totalSlots)
    .fill([startTime])
    .reduce((acc, _, i) => [...acc, startTime + (i * increment)])
}

const toTimeValue = timestamp =>
  new Date(timestamp).toTimeString().substring(0, 5)

const TimeSlotTable = ({
  salonOpensAt,
  salonClosesAt
}) => {
  const timeSlots = dailyTimeSlots(salonOpensAt, salonClosesAt)
  return (
    <table id="time-slots">
      <tbody>
        {timeSlots.map(timeSlot => (
          <tr key={timeSlot}>
            <th>{toTimeValue(timeSlot)}</th>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export const AppointmentForm = ({
  selectableServices,
  service,
  onSubmit,
  salonOpensAt,
  salonClosesAt
}) => {
  const [appointment, setAppointment] = useState({ service });
  const handleSelectBoxChange = ({ target: { value, name } }) =>
    setAppointment(appointment => ({
      ...appointment,
      [name]: value
    }));

  return <form id="appointment" onSubmit={() => onSubmit(appointment)}>
    <label htmlFor="service">Salon service</label>
    <select
      name="service"
      id="service"
      value={service}
      onChange={handleSelectBoxChange}>
      <option />
      {selectableServices.map(s =>
        <option key={s}>{s}</option>
      )}
    </select>
    <TimeSlotTable
      salonOpensAt={salonOpensAt}
      salonClosesAt={salonClosesAt}
    />
  </form>
}

AppointmentForm.defaultProps = {
  salonOpensAt: 9,
  salonClosesAt: 19,
  selectableServices: [
    'Cut',
    'Blow-dry',
    'Cut & color',
    'Beard trim',
    'Cut & beard trim',
    'Extensions']
};
