import React, { useState } from 'react'

const dailyTimeSlots = (salonOpensAt, salonClosesAt) => {
  const totalSlots = (salonClosesAt - salonOpensAt) * 2;
  const startTime = new Date().setHours(salonOpensAt, 0, 0, 0);
  const increment = 30 * 60 * 1000;
  return Array(totalSlots)
    .fill([startTime])
    .reduce((acc, _, i) => [...acc, startTime + (i * increment)])
}

const weeklyDateValues = startDate => {
  const midnight = new Date(startDate).setHours(0, 0, 0, 0)
  const increment = 24 * 60 * 60 * 1000
  return Array(7)
    .fill([midnight])
    .reduce((acc, _, i) => [...acc, midnight + (i * increment)])
}

const toTimeValue = timestamp =>
  new Date(timestamp).toTimeString().substring(0, 5)

const toShortDate = timestamp => {
  const [day, , dayOfMonth] = new Date(timestamp)
    .toDateString()
    .split(' ')
  return `${day} ${dayOfMonth}`
}

const mergeDateAndTime = (date, timeSlot) => {
  const time = new Date(timeSlot);
  return new Date(date).setHours(
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds()
  )
}

const TimeSlotTable = ({
  salonOpensAt,
  salonClosesAt,
  today,
  availableTimeSlots
}) => {
  const timeSlots = dailyTimeSlots(salonOpensAt, salonClosesAt)
  const dates = weeklyDateValues(today)
  return (
    <table id="time-slots">
      <thead>
        <tr>
          <th />
          {dates.map(d =>
            <th key={d}>{toShortDate(d)}</th>)}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map(timeSlot => (
          <tr key={timeSlot}>
            <th>{toTimeValue(timeSlot)}</th>
            {dates.map(date => (
              <td key={date}>
                {availableTimeSlots.some(e =>
                  e.startsAt === mergeDateAndTime(date, timeSlot)
                ) ? <input type="radio" />
                  : null
                }
              </td>
            ))}
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
  salonClosesAt,
  today,
  availableTimeSlots
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
      today={today}
      availableTimeSlots={availableTimeSlots}
    />
  </form>
}

AppointmentForm.defaultProps = {
  availableTimeSlots: [],
  salonOpensAt: 9,
  salonClosesAt: 19,
  today: new Date(),
  selectableServices: [
    'Cut',
    'Blow-dry',
    'Cut & color',
    'Beard trim',
    'Cut & beard trim',
    'Extensions']
};
