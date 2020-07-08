import React, { useState, useEffect } from 'react'

export const AppointmentsDayViewLoader = ({ today }) => {
  const from = today.setHours(0, 0, 0, 0)
  const to = today.setHours(23, 59, 59, 999)

  useEffect(() => {
    const fetchAppointments = async () => {
      const result = await window.fetch(`/appointments/${from}-${to}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
      })
    }

    fetchAppointments()
  }, [from, to]);

  return (
    null
  )
}
