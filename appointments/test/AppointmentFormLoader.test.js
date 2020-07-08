import React from 'react'
import 'whatwg-fetch'
import { createContainer, withEvent } from './domManipulators';
import { AppointmentFormLoader } from '../src/AppointmentFormLoader';
import {
  fetchResponseOk,
  fetchResponseError,
  requestBodyOf
} from './spyHelpers'

describe('AppointmentFormLoader', () => {
  let render, container;

  const today = new Date();
  const availableTimeSlots = [{ startsAt: today.setHours(9, 0, 0, 0) }];

  beforeEach(() => {
    ({ render, container, } = createContainer())
    jest
      .spyOn(window, 'fetch')
      .mockReturnValue(fetchResponseOk(availableTimeSlots))
  });

  afterEach(() => {
    window.fetch.mockRestore()
  });

  it('fetches data when the component is mounted', () => {
    render(<AppointmentFormLoader />);
    expect(window.fetch).toHaveBeenCalledWith(
      '/availableTimeSlots',
      expect.objectContaining({
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });
});
