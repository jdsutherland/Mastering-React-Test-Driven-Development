import React from 'react'
import ReactTestUtils from 'react-dom/test-utils';
import 'whatwg-fetch'
import { createContainer, withEvent } from './domManipulators';
import { AppointmentForm, TimeSlotTable } from '../src/AppointmentForm';
import {
  fetchResponseOk,
  fetchResponseError,
  requestBodyOf
} from './spyHelpers'

describe('AppointmentForm', () => {
  let element, render, container, form,
    field, labelFor, change, submit, elements

  beforeEach(() => {
    ({
      element,
      render,
      container,
      form,
      field,
      labelFor,
      change,
      submit,
      elements
    } = createContainer())
    jest
      .spyOn(window, 'fetch')
      .mockReturnValue(fetchResponseOk({}))
  });

  afterEach(() => {
    window.fetch.mockRestore();
  });

  const startsAtField = index =>
    elements(`input[name="startsAt"]`)[index];

  const findOption = (dropdownNode, textContent) => {
    const options = Array.from(dropdownNode.childNodes);
    return options.find(o => o.textContent === textContent)
  }

  it('renders a form', () => {
    render(<AppointmentForm />);
    expect(form('appointment')).not.toBeNull();
  });

  it('has a submit button', () => {
    render(<AppointmentForm />);
    expect(element('input[type="submit"]')).not.toBeNull();
  });

  it('calls fetch w/ the right props when submitting data', async () => {
    render(<AppointmentForm />);

    await submit(form('appointment'));

    expect(window.fetch).toHaveBeenCalledWith('/appointments',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
      }));
  });

  it('notifies onSave when form is submitted', async () => {
    const saveSpy = jest.fn();

    render(<AppointmentForm onSave={saveSpy}/>);
    await submit(form('appointment'));

    expect(saveSpy).toHaveBeenCalled();
  });

  it('does not notify onSave if the POST request returns an error', async () => {
    window.fetch.mockReturnValue(fetchResponseError());
    const saveSpy = jest.fn();

    render(<AppointmentForm onSave={saveSpy}/>);
    await submit(form('appointment'));

    expect(saveSpy).not.toHaveBeenCalled()
  });

  it('prevents the default action when submitting the form', async () => {
    const preventDefaultSpy = jest.fn();

    render(<AppointmentForm />);
    await submit(form('appointment'), {
      preventDefault: preventDefaultSpy
    });

    expect(preventDefaultSpy).toHaveBeenCalled()
  });

  it('renders an error message when fetch call fails', async () => {
    window.fetch.mockReturnValue(fetchResponseError());

    render(<AppointmentForm />);
    await submit(form('appointment'));

    expect(element('.error')).not.toBeNull()
    expect(element('.error').textContent).toMatch('error occurred')
  });

  it('clears error message when fetch succeeds', async () => {
    window.fetch.mockReturnValue(fetchResponseError());
    render(<AppointmentForm />);
    await submit(form('appointment'));

    window.fetch.mockReturnValue(fetchResponseOk());
    render(<AppointmentForm />);
    await submit(form('appointment'));

    expect(element('.error')).toBeNull()
  });

  const itRendersALabel = (fieldName, text) =>
    it('renders a label', () => {
      render(<AppointmentForm />)
      expect(labelFor(fieldName)).not.toBeNull()
      expect(labelFor(fieldName).textContent).toEqual(text)
    });

  const itAssignsAnIdThatMatchesTheLabelId = (fieldName) =>
    it('assigns an id that matches the label id', () => {
      render(<AppointmentForm />)
      expect(field('appointment', fieldName).id).toEqual(fieldName)
    });

  const itSubmitsExistingValue = (fieldName, value) =>
    it('saves existing value when submitted', async () => {
      render(
        <AppointmentForm
          { ...{[fieldName]: value} }
          onSubmit={props =>
              expect(props[fieldName]).toEqual(value)
          }
        />
      )
      await submit(form('appointment'));
    });

  const itSubmitsNewValue = (fieldName, value) =>
    it('saves new value when submitted', async () => {
      render(
        <AppointmentForm
          { ...{[fieldName]: value} }
          onSubmit={props =>
              expect(props[fieldName]).toEqual(value)
          }
        />
      )
      await change(
        field('appointment', fieldName),
        withEvent(fieldName, value)
      );
      await submit(form('appointment'));
    });

  describe('service field', () => {
    it('renders as a select box', () => {
      render(<AppointmentForm />);
      expect(form('appointment').elements.service).not.toBeNull();
      expect(field('appointment', 'service').tagName).toEqual('SELECT')
    });

    it('initially has a blank value chosen', () => {
      render(<AppointmentForm />);
      const firstNode = field('appointment', 'service').childNodes[0]
      expect(firstNode.value).toEqual('');
      expect(firstNode.selected).toBeTruthy()
    });

    it('lists all salon services', () => {
      const selectableServices = ['Cut', 'Blow-dry'];
      render(<AppointmentForm selectableServices={selectableServices} />);
      const optionNodes = Array.from(field('appointment', 'service').childNodes);
      const renderedServices = optionNodes.map(node => node.textContent);
      expect(renderedServices).toEqual(
        expect.arrayContaining(selectableServices)
      )
    })

    it('pre-selects the existing value', () => {
      const services = ['Cut', 'Blow-dry'];
      render(
        <AppointmentForm
          selectableServices={services}
          service="Blow-dry"
        />
      );
      const option = findOption(field('appointment', 'service'), 'Blow-dry')
      expect(option.selected).toBeTruthy();
    });

    itRendersALabel('service', 'Salon service')
    itAssignsAnIdThatMatchesTheLabelId('service')
    itSubmitsExistingValue('service', 'value')
    itSubmitsNewValue('service', 'newValue')
  });

  describe('stylist field', () => {
    it('renders as a select box', () => {
      render(<AppointmentForm />);
      expect(form('appointment').elements.stylist).not.toBeNull();
      expect(field('appointment', 'stylist').tagName).toEqual('SELECT')
    });

    it('initially has a blank value chosen', () => {
      render(<AppointmentForm />);
      const firstNode = field('appointment', 'stylist').childNodes[0]
      expect(firstNode.value).toEqual('');
      expect(firstNode.selected).toBeTruthy()
    });

    it('pre-selects the existing value', () => {
      const selectableStylists = ['Ashley', 'Jo', 'Pat', 'Sam'];
      render(
        <AppointmentForm
          selectableStylists={selectableStylists}
          stylist="Ashley"
        />
      );
      const option = findOption(field('appointment', 'stylist'), 'Ashley')
      expect(option.selected).toBeTruthy();
    });

    itRendersALabel('stylist', 'Stylist')
    itAssignsAnIdThatMatchesTheLabelId('stylist')
    itSubmitsExistingValue('stylist', 'value')
    itSubmitsNewValue('stylist', 'newValue')
  });

  describe('time slot table', () => {
    const timeSlotTable = () => element('table#time-slots');
    const today = new Date();
    const availableTimeSlots = [
      { startsAt: today.setHours(9, 0, 0, 0) },
      { startsAt: today.setHours(9, 30, 0, 0) },
    ];

    it('renders a table for time slots', () => {
      render(<AppointmentForm />);
      expect(timeSlotTable()).not.toBeNull()
    });

    it('renders a time slot for every half an hour between open & close times', () => {
      render(<AppointmentForm salonOpensAt={9} salonClosesAt={11} />);
      const timesOfDay = timeSlotTable().querySelectorAll('tbody >* th')
      expect(timesOfDay).toHaveLength(4);
      expect(timesOfDay[0].textContent).toEqual('09:00');
      expect(timesOfDay[1].textContent).toEqual('09:30');
      expect(timesOfDay[3].textContent).toEqual('10:30');
    });

    it('renders an empty cell at the start of every header row', () => {
      render(<AppointmentForm />);
      const headerRow = timeSlotTable().querySelector('thead > tr')
      expect(headerRow.firstChild.textContent).toEqual('');
    });

    it('renders a week of available dates', () => {
      const today = new Date(2018, 11, 1);
      render(<AppointmentForm today={today} />);
      const dates = timeSlotTable().querySelectorAll(
        'thead >* th:not(:first-child)'
      );
      expect(dates).toHaveLength(7);
      expect(dates[0].textContent).toEqual('Sat 01');
      expect(dates[1].textContent).toEqual('Sun 02');
      expect(dates[6].textContent).toEqual('Fri 07');
    });

    it('renders a radio button for each time slot', () => {
      render(
        <AppointmentForm
          availableTimeSlots={availableTimeSlots}
          today={today}
        />
      )
      const cells = timeSlotTable().querySelectorAll('td')
      expect(cells[0].querySelector('input[type="radio"]')).not.toBeNull();
      expect(cells[7].querySelector('input[type="radio"]')).not.toBeNull();
    });

    it('does not render radio buttons for unavailable time slots', () => {
      render(<AppointmentForm availableTimeSlots={[]}/>);
      const timesOfDay = timeSlotTable().querySelectorAll('input')
      expect(timesOfDay).toHaveLength(0);
    });

    it('sets radio button values to the idx of the corresponding appt', () => {
      render(
        <AppointmentForm
          availableTimeSlots={availableTimeSlots}
          today={today}
        />
      )
      expect(startsAtField(0).value).toEqual(
        availableTimeSlots[0].startsAt.toString())
      expect(startsAtField(1).value).toEqual(
        availableTimeSlots[1].startsAt.toString())
    });

    it('pre-selects the existing value', () => {
      render(
        <AppointmentForm
          availableTimeSlots={availableTimeSlots}
          today={today}
          startsAt={availableTimeSlots[0].startsAt}
        />
      );
      expect(startsAtField(0).checked).toEqual(true)
    });

    it('saves existing value when submitted', async () => {
      render(
        <AppointmentForm
          availableTimeSlots={availableTimeSlots}
          today={today}
          startsAt={availableTimeSlots[0].startsAt}
          onSubmit={({ startsAt }) =>
              expect(startsAt).toEqual(
                availableTimeSlots[0].startsAt
              )
          }
        />
      );
      await submit(form('appointment'));
    });

    it('saves new value when submitted', async () => {
      render(
        <AppointmentForm
          availableTimeSlots={availableTimeSlots}
          today={today}
          startsAt={availableTimeSlots[0].startsAt}
          onSubmit={({ startsAt }) =>
              expect(startsAt).toEqual(availableTimeSlots[1].startsAt)}
        />
      );
      await change(
        startsAtField(1),
        withEvent('startsAt', availableTimeSlots[1].startsAt.toString())
      )
      await submit(form('appointment'));
    });
  });
});

