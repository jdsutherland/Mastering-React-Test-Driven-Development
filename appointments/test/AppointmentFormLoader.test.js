import React from 'react'
import 'whatwg-fetch'
import { createContainer, withEvent } from './domManipulators';
import { AppointmentFormLoader } from '../src/AppointmentFormLoader';
import {
  fetchResponseOk,
  fetchResponseError,
  requestBodyOf
} from './spyHelpers'
import * as AppointmentFormExports from '../src/AppointmentForm';

describe('AppointmentFormLoader', () => {
  let renderAndWait, container;

  const today = new Date();
  const availableTimeSlots = [{ startsAt: today.setHours(9, 0, 0, 0) }];

  beforeEach(() => {
    ({ renderAndWait, container } = createContainer())
    jest
      .spyOn(window, 'fetch')
      .mockReturnValue(fetchResponseOk(availableTimeSlots))
    jest
      .spyOn(AppointmentFormExports, 'AppointmentForm')
      .mockReturnValue(null)
  });

  afterEach(() => {
    window.fetch.mockRestore()
    AppointmentFormExports.AppointmentForm.mockRestore()
  });

  it('fetches data when the component is mounted', async () => {
    await renderAndWait(<AppointmentFormLoader />);
    expect(window.fetch).toHaveBeenCalledWith(
      '/availableTimeSlots',
      expect.objectContaining({
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  it('initially passes no date to the AppointmentForm', async () => {
    await renderAndWait(<AppointmentFormLoader />);

    expect(AppointmentFormExports.AppointmentForm)
      .toHaveBeenCalledWith({ availableTimeSlots: [] }, expect.anything());
  });

  it('displays time slots that are fetched on mount', async () => {
    await renderAndWait(<AppointmentFormLoader />);

    expect(AppointmentFormExports.AppointmentForm)
      .toHaveBeenLastCalledWith({availableTimeSlots}, expect.anything());
  });
});
