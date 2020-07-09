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
  const validCustomer = {
    firstName: 'first',
    lastName: 'last',
    phoneNumber: '123456789'
  };

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
    render(<CustomerForm {...validCustomer}/>)
    expect(form('customer')).not.toBeNull()
  });

  it('has a submit button', () => {
    render(<CustomerForm {...validCustomer}/>);
    const submitButton = element('input[type="submit"]');
    expect(submitButton).not.toBeNull();
  });

  it('does not submit form when there are validation errors', async () => {
    render(<CustomerForm />);

    await submit(form('customer'));
    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('renders validation errors after submission fails', async () => {
    render(<CustomerForm />);

    await submit(form('customer'));

    expect(window.fetch).not.toHaveBeenCalled();
    expect(element('.error')).not.toBeNull();
  });

  it('renders field validation errors from server', async () => {
    const errors = {
      phoneNumber: 'Phone number already exists in the system'
    }
    window.fetch.mockReturnValue(fetchResponseError(422, {errors}));

    render(<CustomerForm {...validCustomer} />);
    await submit(form('customer'));

    expect(element('.error').textContent).toMatch(errors.phoneNumber)
  });

  it('calls fetch w/ the right props when submitting data', async () => {
    render(<CustomerForm {...validCustomer}/>);

    await submit(form('customer'));

    expect(window.fetch).toHaveBeenCalledWith('/customers',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
      }));
  });

  it('notifies onSave when form is submitted', async () => {
    window.fetch.mockReturnValue(fetchResponseOk(validCustomer));
    const saveSpy = jest.fn();

    render(
      <CustomerForm
        {...validCustomer}
        onSave={saveSpy}
      />);
    await submit(form('customer'));

    expect(saveSpy).toHaveBeenCalledWith(validCustomer)
  });

  it('does not notify onSave if the POST request returns an error', async () => {
    window.fetch.mockReturnValue(fetchResponseError());
    const saveSpy = jest.fn();

    render(
      <CustomerForm
        {...validCustomer}
        onSave={saveSpy}
      />);
    await submit(form('customer'));

    expect(saveSpy).not.toHaveBeenCalled()
  });

  it('prevents the default action when submitting the form', async () => {
    const preventDefaultSpy = jest.fn();

    render(<CustomerForm {...validCustomer} />);
    await submit(form('customer'), {
      preventDefault: preventDefaultSpy
    });

    expect(preventDefaultSpy).toHaveBeenCalled()
  });

  it('renders an error message when fetch call fails', async () => {
    window.fetch.mockReturnValue(fetchResponseError());

    render(<CustomerForm {...validCustomer} />);
    await submit(form('customer'));

    expect(element('.error')).not.toBeNull()
    expect(element('.error').textContent).toMatch('error occurred')
  });

  it('clears error message when fetch succeeds', async () => {
    window.fetch.mockReturnValue(fetchResponseError());
    render(<CustomerForm {...validCustomer} />);
    await submit(form('customer'));

    window.fetch.mockReturnValue(fetchResponseOk());
    render(<CustomerForm {...validCustomer} />);
    await submit(form('customer'));

    expect(element('.error')).toBeNull()
  });

  const itRendersAsATextBox = (fieldName) =>
    it('renders as a text box', () => {
      render(<CustomerForm {...validCustomer} />)
      expectToBeInputFieldOfTypeText(field('customer', fieldName))
    });

  const expectToBeInputFieldOfTypeText = formElement => {
    expect(formElement).not.toBeNull();
    expect(formElement.tagName).toEqual('INPUT');
    expect(formElement.type).toEqual('text');
  };

  const itIncludesTheExistingValue = (fieldName) =>
    it('includes the existing value', () => {
      render(
        <CustomerForm
          {...validCustomer}
          { ...{[fieldName]: 'value' } }
        />)
      expect(field('customer', fieldName).value).toEqual('value');
    });

  const itRendersALabel = (fieldName, text) =>
    it('renders a label', () => {
      render(<CustomerForm {...validCustomer} />)
      expect(labelFor(fieldName)).not.toBeNull()
      expect(labelFor(fieldName).textContent).toEqual(text)
    });

  const itAssignsAnIdThatMatchesTheLabelId = (fieldName) =>
    it('assigns an id that matches the label id', () => {
      render(<CustomerForm {...validCustomer} />)
      expect(field('customer', fieldName).id).toEqual(fieldName)
    });

  const itSubmitsExistingValue = (fieldName, value) =>
    it('saves existing value when submitted', async () => {
      render(
        <CustomerForm
          {...validCustomer}
          { ...{[fieldName]: value} }
        />)
      await submit(form('customer'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        [fieldName]: value
      });
    });

  const itSubmitsNewValue = (fieldName, value = 'newValue') =>
    it('saves new value when submitted', async () => {
      render(
        <CustomerForm
          {...validCustomer}
          { ...{[fieldName]: 'existing'} }
        />
      )
      await change(
        field('customer', fieldName),
        withEvent(fieldName, value)
      );
      await submit(form('customer'));

      expect(requestBodyOf(window.fetch)).toMatchObject({
        [fieldName]: value
      });
    });

  const itInvalidatesFieldWithValue = (
    fieldName,
    value,
    description
  ) => {
    it(`displays error after blur when ${fieldName} field is ${value}`, () => {
      render(<CustomerForm {...validCustomer} />)

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
    itSubmitsNewValue('phoneNumber', '0123456789+()- ')
    itInvalidatesFieldWithValue('phoneNumber', ' ', 'Phone number is required')
    itInvalidatesFieldWithValue(
      'phoneNumber',
      'invalid',
      'Only numbers, spaces, and these symbols allowed: ( ) + -')

    it('accepts standard phone number characters when validating', () => {
      render(<CustomerForm {...validCustomer} />);
      blur(
        element("[name='phoneNumber']"),
        withEvent('phoneNumber', '0123456789+()- '));
      expect(element('.error')).toBeNull();
    });
  });
});
