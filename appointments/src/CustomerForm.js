import React, { useState } from 'react'

export const CustomerForm = ({
  firstName,
  lastName,
  phoneNumber,
  onSave
}) => {
  const [customer, setCustomer] = useState({
    firstName,
    lastName,
    phoneNumber
  });
  const [error, setError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = ({ target }) =>
    setCustomer(customer => ({
      ...customer,
      [target.name]: target.value
    }))

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await window.fetch('/customers', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    })
    if (result.ok) {
      setError(false)
      const customerWithId = await result.json();
      onSave(customerWithId);
    } else {
      setError(true)
    }
  }

  const required = description => value =>
    !value || value.trim() === '' ? description : undefined

  const handleBlur = ({ target }) => {
    const validators = {
      firstName: required('First name is required'),
      lastName: required('Last name is required')
    }
    const result = validators[target.name](target.value)
    setValidationErrors({
      ...validationErrors,
      [target.name]: result
    })
  }

  const hasError = fieldName =>
    validationErrors[fieldName] !== undefined

  const renderError = (fieldName) => {
    if (hasError(fieldName)) {
      return (
        <span className="error">
          {validationErrors[fieldName]}
        </span>
      )
    }
  }

  return <form id="customer" onSubmit={handleSubmit}>
    { error ? <Error /> : null }
    <label htmlFor="firstName">First name</label>
    <input
      type="text"
      name="firstName"
      id="firstName"
      value={firstName}
      onChange={handleChange}
      onBlur={handleBlur}
    />
    {renderError('firstName')}

    <label htmlFor="lastName">Last name</label>
    <input
      type="text"
      name="lastName"
      id="lastName"
      value={lastName}
      onChange={handleChange}
      onBlur={handleBlur}
    />
    {renderError('lastName')}

    <label htmlFor="phoneNumber">Phone number</label>
    <input
      type="text"
      name="phoneNumber"
      id="phoneNumber"
      value={phoneNumber}
      onChange={handleChange}
    />

    <input type="submit" value="Add" />
  </form>
}

CustomerForm.defaultProps = {
  onSave: () => {}
}

const Error = () =>
  <div className="error">An error occurred during the save.</div>
