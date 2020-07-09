import React from 'react'
import 'whatwg-fetch'
import { createContainer, withEvent } from './domManipulators'
import {
  fetchResponseOk,
  fetchResponseError,
  requestBodyOf
} from './spyHelpers'
import { CustomerForm } from '../src/CustomerForm'

describe('CustomerForm', () => {
  let element, render, container, form,
    field, labelFor, change, submit, blur

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
      blur
    } = createContainer())
    jest
      .spyOn(window, 'fetch')
      .mockReturnValue(fetchResponseOk({}))
  });

  afterEach(() => {
    window.fetch.mockRestore();
  });

  const spy = () => {
    let receivedArguments;
    let returnValue;
    return {
      fn: (...args) => {
        receivedArguments = args;
        return returnValue;
      },
      receivedArguments: () => receivedArguments,
      receivedArgument: n => receivedArguments[n],
      mockReturnValue: value => returnValue = value
    }
  }

  it('renders a form', () => {
    render(<CustomerForm />)
    expect(form('customer')).not.toBeNull()
  });

  it('has a submit button', () => {
    render(<CustomerForm />);
    const submitButton = element('input[type="submit"]');
    expect(submitButton).not.toBeNull();
  });

  it('calls fetch w/ the right props when submitting data', async () => {
    render(<CustomerForm />);

    await submit(form('customer'));

    expect(window.fetch).toHaveBeenCalledWith('/customers',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
      }));
  });

  it('notifies onSave when form is submitted', async () => {
    const customer = { id: 123 };
    window.fetch.mockReturnValue(fetchResponseOk(customer));
    const saveSpy = jest.fn();

    render(<CustomerForm onSave={saveSpy}/>);
    await submit(form('customer'));

    expect(saveSpy).toHaveBeenCalledWith(customer)
  });

  it('does not notify onSave if the POST request returns an error', async () => {
    window.fetch.mockReturnValue(fetchResponseError());
    const saveSpy = jest.fn();

    render(<CustomerForm onSave={saveSpy}/>);
    await submit(form('customer'));

    expect(saveSpy).not.toHaveBeenCalled()
  });

  it('prevents the default action when submitting the form', async () => {
    const preventDefaultSpy = jest.fn();

    render(<CustomerForm />);
    await submit(form('customer'), {
      preventDefault: preventDefaultSpy
    });

    expect(preventDefaultSpy).toHaveBeenCalled()
  });

  it('renders an error message when fetch call fails', async () => {
    window.fetch.mockReturnValue(fetchResponseError());

    render(<CustomerForm />);
    await submit(form('customer'));

    expect(element('.error')).not.toBeNull()
    expect(element('.error').textContent).toMatch('error occurred')
  });

  it('clears error message when fetch succeeds', async () => {
    window.fetch.mockReturnValue(fetchResponseError());
    render(<CustomerForm />);
    await submit(form('customer'));

    window.fetch.mockReturnValue(fetchResponseOk());
    render(<CustomerForm />);
    await submit(form('customer'));

    expect(element('.error')).toBeNull()
  });

  const itRendersAsATextBox = (fieldName) =>
    it('renders as a text box', () => {
      render(<CustomerForm />)
      expectToBeInputFieldOfTypeText(field('customer', fieldName))
    });

  const expectToBeInputFieldOfTypeText = formElement => {
    expect(formElement).not.toBeNull();
    expect(formElement.tagName).toEqual('INPUT');
    expect(formElement.type).toEqual('text');
  };

  const itIncludesTheExistingValue = (fieldName) =>
    it('includes the existing value', () => {
      render(<CustomerForm { ...{[fieldName]: 'value' } }/>)
      expect(field('customer', fieldName).value).toEqual('value');
    });

  const itRendersALabel = (fieldName, text) =>
    it('renders a label', () => {
      render(<CustomerForm />)
      expect(labelFor(fieldName)).not.toBeNull()
      expect(labelFor(fieldName).textContent).toEqual(text)
    });

  const itAssignsAnIdThatMatchesTheLabelId = (fieldName) =>
    it('assigns an id that matches the label id', () => {
      render(<CustomerForm />)
      expect(field('customer', fieldName).id).toEqual(fieldName)
    });

  const itSubmitsExistingValue = (fieldName, value) =>
    it('saves existing value when submitted', async () => {
      render(<CustomerForm { ...{[fieldName]: value} } />)
      await submit(form('customer'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        [fieldName]: value
      });
    });

  const itSubmitsNewValue = (fieldName) =>
    it('saves new value when submitted', async () => {
      render(<CustomerForm { ...{[fieldName]: 'aValue'} } />
      )
      await change(
        field('customer', fieldName),
        withEvent(fieldName, 'newValue')
      );
      await submit(form('customer'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        [fieldName]: 'newValue'
      });
    });

  const itInvalidatesFieldWithValue = (
    fieldName,
    value,
    description
  ) => {
    it(`displays error after blur when ${fieldName} field is ${value}`, () => {
      render(<CustomerForm />)

      blur(
        field('customer', fieldName),
        withEvent(fieldName, value))
      expect(element('.error')).not.toBeNull();
      expect(element('.error').textContent).toMatch( description);
    });
  }

  describe('first name field', () => {
    itRendersAsATextBox('firstName')
    itIncludesTheExistingValue('firstName')
    itRendersALabel('firstName', 'First name')
    itAssignsAnIdThatMatchesTheLabelId('firstName')
    itSubmitsExistingValue('firstName', 'value')
    itSubmitsNewValue('firstName')
    itInvalidatesFieldWithValue('firstName', ' ', 'First name is required')
  });

  describe('last name field', () => {
    itRendersAsATextBox('lastName')
    itIncludesTheExistingValue('lastName')
    itRendersALabel('lastName', 'Last name')
    itAssignsAnIdThatMatchesTheLabelId('lastName')
    itSubmitsExistingValue('lastName', 'value')
    itSubmitsNewValue('lastName', 'newValue')
    itInvalidatesFieldWithValue('lastName', ' ', 'Last name is required')
  });

  describe('phone number field', () => {
    itRendersAsATextBox('phoneNumber')
    itIncludesTheExistingValue('phoneNumber')
    itRendersALabel('phoneNumber', 'Phone number')
    itAssignsAnIdThatMatchesTheLabelId('phoneNumber')
    itSubmitsExistingValue('phoneNumber', '12345')
    itSubmitsNewValue('phoneNumber', '56789')
  });
});
