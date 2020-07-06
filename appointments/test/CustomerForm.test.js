import React from 'react'
import ReactTestUtils from 'react-dom/test-utils';
import { createContainer } from './domManipulators'
import { CustomerForm } from '../src/CustomerForm'

describe('CustomerForm', () => {
  let render, container;

  beforeEach(() => {
    ({ render, container } = createContainer())
  });

  const form = id => container.querySelector(`form[id="${id}"]`)
  const field = name => form('customer').elements[name]
  const labelFor = formElement =>
    container.querySelector(`label[for="${formElement}"]`)

  const itRendersAsATextBox = (fieldName) =>
    it('renders as a text box', () => {
      render(<CustomerForm />)
      expectToBeInputFieldOfTypeText(field(fieldName))
    });

  const expectToBeInputFieldOfTypeText = formElement => {
    expect(formElement).not.toBeNull();
    expect(formElement.tagName).toEqual('INPUT');
    expect(formElement.type).toEqual('text');
  };

  const itIncludesTheExistingValue = (fieldName) =>
    it('includes the existing value', () => {
      render(<CustomerForm { ...{[fieldName]: 'value' } }/>)
      expect(field(fieldName).value).toEqual('value');
    });

  const itRendersALabel = (fieldName, text) =>
    it('renders a label', () => {
      render(<CustomerForm />)
      expect(labelFor(fieldName)).not.toBeNull()
      expect(labelFor(fieldName).textContent).toEqual(text)
    });

  describe('first name field', () => {
    it('renders a form', () => {
      render(<CustomerForm />)
      expect(form('customer')).not.toBeNull()
    });

    itRendersAsATextBox('firstName')

    itIncludesTheExistingValue('firstName')

    itRendersALabel('firstName', 'First name')

    it('assigns an id that matches the label id to the first name field', () => {
      render(<CustomerForm />)
      expect(field('firstName').id).toEqual('firstName')
    });

    it('saves existing first name when submitted', async () => {
      expect.hasAssertions();
      render(
        <CustomerForm
          firstName='Ashley'
          onSubmit={ ({ firstName }) =>
              expect(firstName).toEqual('Ashley')
          }
        />
      )
      await ReactTestUtils.Simulate.submit(form('customer'));
    });

    it('saves new first name when submitted', async () => {
      expect.hasAssertions();
      render(
        <CustomerForm
          firstName='Ashley'
          onSubmit={ ({ firstName }) =>
              expect(firstName).toEqual('Jamie')
          }
        />
      )
      await ReactTestUtils.Simulate.change(field('firstName'), {
        target: { value: 'Jamie' }
      });
      await ReactTestUtils.Simulate.submit(form('customer'));
    });
  });
});
