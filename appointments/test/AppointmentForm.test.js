import React from 'react'
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
    field, labelFor, change, submit, elements, children

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
      elements,
      children
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

  const itRendersALabel = (fieldName, text) =>
    it('renders a label', () => {
      render(<AppointmentForm />)
      expect(labelFor(fieldName)).not.toBeNull()
      expect(labelFor(fieldName).textContent).toEqual(text)
    });

  const itRendersAsASelectBox = name => {
    it('renders as a select box', () => {
      render(<AppointmentForm />);
      expect(form('appointment').elements[name]).not.toBeNull();
      expect(field('appointment', name).tagName).toEqual('SELECT')
    });
  }

  const itInitiallyHasABlankValueChosen = name => {
    it('initially has a blank value chosen', () => {
      render(<AppointmentForm />);
      const firstNode = field('appointment', name).childNodes[0]
      expect(firstNode.value).toEqual('');
      expect(firstNode.selected).toBeTruthy()
    });
  }

  const itPreselectsExistingValues = (fieldName, existingValue, props) => {
    it('pre-selects the existing value', () => {
      render(
        <AppointmentForm
          {...props}
          {...{ [fieldName]: existingValue } }
        />
      );
      const option = findOption(field('appointment', fieldName), existingValue)
      expect(option.selected).toBeTruthy();
    });
  }

  const itAssignsAnIdThatMatchesTheLabelId = (fieldName) =>
    it('assigns an id that matches the label id', () => {
      render(<AppointmentForm />)
      expect(field('appointment', fieldName).id).toEqual(fieldName)
    });

  const itSubmitsExistingValue = (fieldName, props) => {
    it('saves existing value when submitted', async () => {
      render(
        <AppointmentForm
          {...props}
          {...{ [fieldName]: 'value' }}
        />
      );
      await submit(form('appointment'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        [fieldName]: 'value'
      });
    });
  };

  const itSubmitsNewValue = (fieldName, props) => {
    it('saves new value when submitted', async () => {
      render(
        <AppointmentForm
          {...props}
          {...{ [fieldName]: 'existingValue' }}
        />
      );
      change(
        field('appointment', fieldName),
        withEvent(fieldName, 'newValue')
      );
      await submit(form('appointment'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        [fieldName]: 'newValue'
      });
    });
  };

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
      expect.objectcontaining({
        method: 'post',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' }
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

  describe('service field', () => {
    itRendersAsASelectBox('service')
    itInitiallyHasABlankValueChosen('service')
    itPreselectsExistingValues('service', 'Blow-dry',
      { selectableServices: ['Cut', 'Blow-dry'] })
    itRendersALabel('service', 'Salon service')
    itAssignsAnIdThatMatchesTheLabelId('service')
    itSubmitsExistingValue('service', {
      serviceStylists: { value: [] }
    });
    itSubmitsNewValue('service', {
      serviceStylists: { newValue: [], existingValue: [] }
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
  });

  describe('stylist field', () => {
    itRendersAsASelectBox('stylist')
    itInitiallyHasABlankValueChosen('stylist')
    itPreselectsExistingValues('stylist', 'Ashley',
      { selectableStylists: ['Ashley', 'Jo', 'Pat', 'Sam'] })
    itRendersALabel('stylist', 'Stylist')
    itAssignsAnIdThatMatchesTheLabelId('stylist')
    itSubmitsExistingValue('stylist');
    itSubmitsNewValue('stylist')

    it('lists only stylists that can perform the selected service', () => {
      const selectableServices = ['1', '2'];
      const selectableStylists = ['A', 'B', 'C'];
      const serviceStylists = { '1': ['A', 'B'] };

      render(
        <AppointmentForm
          selectableServices={selectableServices}
          selectableStylists={selectableStylists}
          serviceStylists={serviceStylists}
        />);

      change(
        field('appointment', 'service'),
        withEvent('service', '1'));

      const renderedServices = children(field('appointment', 'stylist'))
        .map(node => node.textContent);
      expect(renderedServices).toEqual(
        expect.arrayContaining(['A', 'B']));
    });
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
        />)
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
        />)
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
        />);
      expect(startsAtField(0).checked).toEqual(true)
    });

    it('saves existing value when submitted', async () => {
      render(
        <AppointmentForm
          availableTimeSlots={availableTimeSlots}
          today={today}
          startsAt={availableTimeSlots[0].startsAt}
        />);
      await submit(form('appointment'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        startsAt: availableTimeSlots[0].startsAt
      });
    });

    it('saves new value when submitted', async () => {
      render(
        <AppointmentForm
          availableTimeSlots={availableTimeSlots}
          today={today}
          startsAt={availableTimeSlots[0].startsAt}
        />);
      await change(
        startsAtField(1),
        withEvent('startsAt', availableTimeSlots[1].startsAt.toString()))
      await submit(form('appointment'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        startsAt: availableTimeSlots[1].startsAt
      });
    });

    it('filters appointments by selected stylist', () => {
      const availableTimeSlots = [
        {
          startsAt: today.setHours(9, 0, 0, 0),
          stylists: ['A', 'B']
        },
        {
          startsAt: today.setHours(9, 30, 0, 0),
          stylists: ['A']
        }
      ];

      render(
        <AppointmentForm
          availableTimeSlots={availableTimeSlots}
          today={today}
        />);

      change(
        field('appointment', 'stylist'),
        withEvent('stylist', 'B'));

      const cells = timeSlotTable().querySelectorAll('td');
      expect(
        cells[0].querySelector('input[type="radio"]')
      ).not.toBeNull();
      expect(
        cells[7].querySelector('input[type="radio"]')
      ).toBeNull();
    });
  });
});
